<?php
/**
 * Dashboard page: launch editor, settings, edited pages, revisions, import/export.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MS_Admin {

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_post_ms_settings', array( __CLASS__, 'handle_settings' ) );
		add_action( 'admin_post_ms_reset', array( __CLASS__, 'handle_reset' ) );
		add_action( 'admin_post_ms_restore', array( __CLASS__, 'handle_restore' ) );
		add_action( 'admin_post_ms_export', array( __CLASS__, 'handle_export' ) );
		add_action( 'admin_post_ms_import', array( __CLASS__, 'handle_import' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( MS_FILE ), array( __CLASS__, 'action_links' ) );
	}

	public static function action_links( $links ) {
		array_unshift( $links, '<a href="' . esc_url( MS_Editor::editor_url() ) . '">' . esc_html__( 'Open Editor', 'motion-studio' ) . '</a>' );
		return $links;
	}

	public static function menu() {
		add_menu_page( 'Motion Studio', 'Motion Studio', MS_CAP, 'motion-studio', array( __CLASS__, 'render' ), 'dashicons-art', 61 );
	}

	private static function check( $action ) {
		if ( ! current_user_can( MS_CAP ) ) {
			wp_die( 'Forbidden' );
		}
		check_admin_referer( $action );
	}

	private static function back( $msg ) {
		wp_safe_redirect( add_query_arg( 'ms_msg', rawurlencode( $msg ), admin_url( 'admin.php?page=motion-studio' ) ) );
		exit;
	}

	public static function handle_settings() {
		self::check( 'ms_settings' );
		update_option(
			'ms_settings',
			array(
				'reduced' => empty( $_POST['reduced'] ) ? 0 : 1,
				'mobile'  => empty( $_POST['mobile'] ) ? 0 : 1,
				'offset'  => isset( $_POST['offset'] ) ? max( 0, min( 0.9, (float) $_POST['offset'] ) ) : 0.15,
			)
		);
		self::back( 'Settings saved.' );
	}

	public static function handle_reset() {
		self::check( 'ms_reset' );
		$key = isset( $_POST['key'] ) ? sanitize_key( wp_unslash( $_POST['key'] ) ) : '';
		if ( $key ) {
			MS_Store::reset( $key );
		}
		self::back( 'Reset done (a revision was kept, you can restore it).' );
	}

	public static function handle_restore() {
		self::check( 'ms_restore' );
		$key = isset( $_POST['key'] ) ? sanitize_key( wp_unslash( $_POST['key'] ) ) : '';
		$i   = isset( $_POST['rev'] ) ? absint( $_POST['rev'] ) : 0;
		self::back( MS_Store::restore( $key, $i ) ? 'Revision restored.' : 'Revision not found.' );
	}

	public static function handle_export() {
		self::check( 'ms_export' );
		$out = array(
			'plugin'   => 'motion-studio',
			'version'  => MS_VERSION,
			'settings' => MS_Store::settings(),
			'global'   => MS_Store::get_global(),
			'pages'    => array(),
		);
		foreach ( array_keys( (array) get_option( 'ms_index', array() ) ) as $key ) {
			$out['pages'][ $key ] = array(
				'meta' => get_option( 'ms_index' )[ $key ],
				'data' => MS_Store::get_page( $key ),
			);
		}
		nocache_headers();
		header( 'Content-Type: application/json; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=motion-studio-' . gmdate( 'Y-m-d' ) . '.json' );
		echo wp_json_encode( $out, JSON_PRETTY_PRINT );
		exit;
	}

	public static function handle_import() {
		self::check( 'ms_import' );
		if ( empty( $_FILES['file']['tmp_name'] ) ) {
			self::back( 'No file uploaded.' );
		}
		$json = json_decode( file_get_contents( $_FILES['file']['tmp_name'] ), true ); // phpcs:ignore
		if ( ! is_array( $json ) || ( $json['plugin'] ?? '' ) !== 'motion-studio' ) {
			self::back( 'That is not a Motion Studio export file.' );
		}
		if ( ! empty( $json['global'] ) ) {
			MS_Store::save_global( MS_Store::sanitize_data( $json['global'] ) );
		}
		$n = 0;
		foreach ( (array) ( $json['pages'] ?? array() ) as $key => $p ) {
			MS_Store::save_page( sanitize_key( $key ), MS_Store::sanitize_data( $p['data'] ?? array() ), (array) ( $p['meta'] ?? array() ) );
			$n++;
		}
		self::back( sprintf( 'Imported global design + %d page(s).', $n ) );
	}

	private static function form_open( $action ) {
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="display:inline">';
		echo '<input type="hidden" name="action" value="' . esc_attr( $action ) . '">';
		wp_nonce_field( $action );
	}

	public static function render() {
		$s     = MS_Store::settings();
		$index = (array) get_option( 'ms_index', array() );
		$glob  = MS_Store::get_global();
		$pages = get_pages( array( 'number' => 200 ) );
		?>
		<div class="wrap">
			<h1 style="display:flex;align-items:center;gap:8px"><span class="dashicons dashicons-art"></span> Motion Studio</h1>
			<?php if ( ! empty( $_GET['ms_msg'] ) ) : // phpcs:ignore ?>
				<div class="notice notice-success is-dismissible"><p><?php echo esc_html( wp_unslash( $_GET['ms_msg'] ) ); // phpcs:ignore ?></p></div>
			<?php endif; ?>

			<div class="card" style="max-width:820px">
				<h2>Open the visual editor</h2>
				<p>Pick a page, click any element and edit content, animations, FX, text styles and layout. Tip: you can also use <strong>“Edit with Motion Studio”</strong> in the admin bar on any page.</p>
				<form method="get" action="<?php echo esc_url( admin_url( 'admin.php' ) ); ?>">
					<input type="hidden" name="page" value="<?php echo esc_attr( MS_Editor::SLUG ); ?>">
					<select name="url" style="min-width:320px">
						<option value="<?php echo esc_attr( home_url( '/' ) ); ?>">Home page</option>
						<?php foreach ( $pages as $p ) : ?>
							<option value="<?php echo esc_attr( get_permalink( $p ) ); ?>"><?php echo esc_html( $p->post_title ? $p->post_title : '#' . $p->ID ); ?></option>
						<?php endforeach; ?>
					</select>
					<button class="button button-primary button-hero" style="vertical-align:middle">Launch Editor</button>
				</form>
			</div>

			<div class="card" style="max-width:820px">
				<h2>Edited pages</h2>
				<table class="widefat striped">
					<thead><tr><th>Page</th><th>Rules</th><th>Updated</th><th>Actions</th></tr></thead>
					<tbody>
					<tr>
						<td><strong>Global (all pages)</strong> – header, menu, footer…</td>
						<td><?php echo (int) count( $glob['rules'] ); ?></td>
						<td>—</td>
						<td><?php self::row_actions( '_global' ); ?></td>
					</tr>
					<?php foreach ( $index as $key => $row ) : ?>
						<tr>
							<td><a href="<?php echo esc_url( $row['url'] ); ?>" target="_blank"><?php echo esc_html( $row['title'] ); ?></a></td>
							<td><?php echo (int) $row['rules']; ?></td>
							<td><?php echo esc_html( human_time_diff( $row['updated'] ) ); ?> ago</td>
							<td>
								<a class="button button-small" href="<?php echo esc_url( MS_Editor::editor_url( $row['url'] ) ); ?>">Edit</a>
								<?php self::row_actions( $key ); ?>
							</td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>
			</div>

			<div class="card" style="max-width:820px">
				<h2>Settings</h2>
				<?php self::form_open( 'ms_settings' ); ?>
					<p><label><input type="checkbox" name="reduced" value="1" <?php checked( $s['reduced'] ); ?>> Respect visitors’ “reduce motion” system setting (recommended for accessibility)</label></p>
					<p><label><input type="checkbox" name="mobile" value="1" <?php checked( $s['mobile'] ); ?>> Run animations &amp; FX on phones</label></p>
					<p><label>Default scroll trigger point <input type="number" step="0.05" min="0" max="0.9" name="offset" value="<?php echo esc_attr( $s['offset'] ); ?>" style="width:80px"></label> <span class="description">(0 = as soon as visible, 0.5 = half visible)</span></p>
					<p><button class="button button-primary">Save settings</button></p>
				</form>
			</div>

			<div class="card" style="max-width:820px">
				<h2>Import / Export</h2>
				<p>Move your whole design (global + all pages) to another site.</p>
				<?php self::form_open( 'ms_export' ); ?><button class="button">Download export (.json)</button></form>
				<form method="post" enctype="multipart/form-data" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin-top:10px">
					<input type="hidden" name="action" value="ms_import"><?php wp_nonce_field( 'ms_import' ); ?>
					<input type="file" name="file" accept=".json,application/json" required>
					<button class="button">Import</button>
				</form>
			</div>
		</div>
		<?php
	}

	private static function row_actions( $key ) {
		$revs = MS_Store::revisions( $key );
		self::form_open( 'ms_reset' );
		echo '<input type="hidden" name="key" value="' . esc_attr( $key ) . '"><button class="button button-small" onclick="return confirm(\'Reset all Motion Studio edits here?\')">Reset</button></form> ';
		if ( $revs ) {
			self::form_open( 'ms_restore' );
			echo '<input type="hidden" name="key" value="' . esc_attr( $key ) . '"><select name="rev">';
			foreach ( $revs as $i => $r ) {
				echo '<option value="' . (int) $i . '">' . esc_html( human_time_diff( $r['time'] ) ) . ' ago (' . (int) count( $r['data']['rules'] ) . ' rules)</option>';
			}
			echo '</select> <button class="button button-small">Restore</button></form>';
		}
	}
}

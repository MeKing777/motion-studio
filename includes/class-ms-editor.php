<?php
/**
 * Full-screen visual editor shell (admin page that loads the site in an iframe).
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MS_Editor {

	const SLUG = 'motion-studio-editor';

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register' ) );
	}

	public static function editor_url( $url = '' ) {
		$url = $url ? $url : home_url( '/' );
		return add_query_arg(
			array(
				'page' => self::SLUG,
				'url'  => rawurlencode( remove_query_arg( 'ms_frame', esc_url_raw( $url, array( 'http', 'https' ) ) ) ),
			),
			admin_url( 'admin.php' )
		);
	}

	public static function register() {
		// Registered under options.php so it has no visible menu entry.
		$hook = add_submenu_page( 'options.php', 'Motion Studio Editor', 'Motion Studio Editor', MS_CAP, self::SLUG, '__return_null' );
		add_action( 'load-' . $hook, array( __CLASS__, 'render' ) );
	}

	/** Only same-site URLs may be loaded into the editor. */
	private static function target_url() {
		// PHP has already URL-decoded $_GET, so decoding again would corrupt addresses that contain "%".
		$url  = isset( $_GET['url'] ) ? esc_url_raw( wp_unslash( $_GET['url'] ), array( 'http', 'https' ) ) : ''; // phpcs:ignore
		$home = wp_parse_url( home_url() );
		$p    = $url ? wp_parse_url( $url ) : false;
		if ( ! $p || empty( $p['host'] ) || strtolower( $p['host'] ) !== strtolower( $home['host'] ) ) {
			$url = home_url( '/' );
		}
		return $url;
	}

	/** URL of the logo set in Appearance → Customize → Site Identity (empty if none). */
	private static function site_logo_url() {
		$id = (int) get_theme_mod( 'custom_logo' );
		if ( $id ) {
			$src = wp_get_attachment_image_url( $id, 'full' );
			if ( $src ) {
				return esc_url_raw( $src );
			}
		}
		$icon = get_site_icon_url( 192 );
		return $icon ? esc_url_raw( $icon ) : '';
	}

	private static function page_list() {
		$out = array( array( 'Home page', home_url( '/' ) ) );
		foreach ( get_pages( array( 'number' => 150, 'sort_column' => 'menu_order,post_title' ) ) as $p ) {
			$out[] = array( $p->post_title ? $p->post_title : '#' . $p->ID, get_permalink( $p ) );
		}
		foreach ( get_posts( array( 'numberposts' => 30 ) ) as $p ) {
			$out[] = array( 'Post: ' . $p->post_title, get_permalink( $p ) );
		}
		return $out;
	}

	public static function render() {
		if ( ! current_user_can( MS_CAP ) ) {
			wp_die( esc_html__( 'Sorry, you are not allowed to use Motion Studio.', 'motion-studio' ) );
		}
		$url = self::target_url();

		nocache_headers();
		header( 'X-Content-Type-Options: nosniff' );
		header( 'Referrer-Policy: same-origin' );
		header( 'X-Frame-Options: SAMEORIGIN' );

		wp_enqueue_media();
		wp_enqueue_style( 'motion-studio-runtime', MS_URL . 'assets/runtime.css', array(), MS_VERSION );
		wp_enqueue_style( 'motion-studio-editor', MS_URL . 'assets/editor.css', array( 'motion-studio-runtime', 'dashicons' ), MS_VERSION );
		wp_enqueue_script( 'motion-studio-editor', MS_URL . 'assets/editor.js', array( 'jquery' ), MS_VERSION, true );
		wp_localize_script(
			'motion-studio-editor',
			'MS_EDITOR',
			array(
				'rest'      => esc_url_raw( rest_url( 'motion-studio/v1/' ) ),
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'frameUrl'  => add_query_arg( 'ms_frame', '1', $url ),
				'exitUrl'   => $url,
				'adminUrl'  => admin_url( 'admin.php?page=motion-studio' ),
				'pluginUrl' => MS_URL,
				'version'   => MS_VERSION,
				'restRoot'  => esc_url_raw( rest_url() ),
				'canUpload' => current_user_can( 'upload_files' ),
				'home'      => esc_url_raw( home_url( '/' ) ),
				'siteName'  => wp_strip_all_tags( get_bloginfo( 'name' ) ),
				'siteLogo'  => self::site_logo_url(),
				'aiReady'   => '' !== MS_Store::gemini_key(),
				'pages'     => self::page_list(),
			)
		);

		header( 'Content-Type: text/html; charset=' . get_option( 'blog_charset' ) );
		?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?php esc_html_e( 'Motion Studio', 'motion-studio' ); ?></title>
	<?php
	wp_print_styles();
	wp_print_head_scripts();
	?>
</head>
<body class="ms-editor-body wp-core-ui">
	<div id="ms-app"><div class="ms-boot">Loading Motion Studio…</div></div>
	<?php
	wp_print_footer_scripts();
	if ( function_exists( 'wp_print_media_templates' ) ) {
		wp_print_media_templates();
	}
	?>
</body>
</html>
		<?php
		exit;
	}
}

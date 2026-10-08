<?php
/**
 * Plugin Name:       Motion Studio
 * Plugin URI:        https://example.com/motion-studio
 * Description:       Canva-style visual builder for any theme: drag & drop elements, ready sections, image frames, links & connector lines, menu styles, site themes, plus in/out animations, FX, text styles and drag/resize layout – per device.
 * Version:           1.2.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Fahiz
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       motion-studio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MS_VERSION', '1.2.0' );
define( 'MS_FILE', __FILE__ );
define( 'MS_DIR', plugin_dir_path( __FILE__ ) );
define( 'MS_URL', plugin_dir_url( __FILE__ ) );
define( 'MS_CAP', 'edit_theme_options' );

require_once MS_DIR . 'includes/class-ms-store.php';
require_once MS_DIR . 'includes/class-ms-rest.php';
require_once MS_DIR . 'includes/class-ms-frontend.php';
require_once MS_DIR . 'includes/class-ms-editor.php';
require_once MS_DIR . 'includes/class-ms-admin.php';

MS_Rest::init();
MS_Frontend::init();
MS_Editor::init();
MS_Admin::init();

register_activation_hook( __FILE__, function () {
	if ( false === get_option( 'ms_settings' ) ) {
		add_option( 'ms_settings', MS_Store::default_settings() );
	}
} );

/** "Edit with Motion Studio" link under each page/post in the list tables. */
function ms_row_action( $actions, $post ) {
	if ( current_user_can( MS_CAP ) && 'publish' === $post->post_status ) {
		$actions['motion_studio'] = '<a href="' . esc_url( MS_Editor::editor_url( get_permalink( $post ) ) ) . '">' . esc_html__( 'Motion Studio', 'motion-studio' ) . '</a>';
	}
	return $actions;
}
add_filter( 'page_row_actions', 'ms_row_action', 10, 2 );
add_filter( 'post_row_actions', 'ms_row_action', 10, 2 );

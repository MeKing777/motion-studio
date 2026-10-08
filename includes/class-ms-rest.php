<?php
/**
 * REST endpoint used by the visual editor to save.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MS_Rest {

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'routes' ) );
	}

	public static function routes() {
		register_rest_route(
			'motion-studio/v1',
			'/save',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'save' ),
				'permission_callback' => function () {
					return current_user_can( MS_CAP );
				},
			)
		);
	}

	public static function save( WP_REST_Request $req ) {
		$key = sanitize_key( (string) $req->get_param( 'key' ) );
		if ( '' === $key || '_global' === $key ) {
			return new WP_Error( 'ms_bad_key', 'Invalid page key', array( 'status' => 400 ) );
		}

		$page   = MS_Store::sanitize_data( $req->get_param( 'page' ) );
		$global = MS_Store::sanitize_data( $req->get_param( 'global' ) );

		MS_Store::save_page(
			$key,
			$page,
			array(
				'url'   => (string) $req->get_param( 'url' ),
				'title' => (string) $req->get_param( 'title' ),
			)
		);
		if ( $req->get_param( 'saveGlobal' ) ) {
			MS_Store::save_global( $global );
		}

		return rest_ensure_response(
			array(
				'ok'     => true,
				'saved'  => time(),
				'rules'  => count( $page['rules'] ),
				'global' => count( $global['rules'] ),
			)
		);
	}
}

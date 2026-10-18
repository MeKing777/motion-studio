<?php
/**
 * Front-end output: saved CSS in <head>, runtime JS (animations / FX / content edits),
 * Google Fonts, admin-bar launcher, and the "frame" mode used inside the editor.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MS_Frontend {

	private static $page   = null;
	private static $global = null;
	private static $key    = '';

	public static function init() {
		add_action( 'wp', array( __CLASS__, 'setup' ) );
		add_action( 'admin_bar_menu', array( __CLASS__, 'admin_bar' ), 90 );
	}

	/** True when the page is rendered inside the editor iframe. */
	public static function is_frame() {
		return isset( $_GET['ms_frame'] ) && current_user_can( MS_CAP ); // phpcs:ignore WordPress.Security.NonceVerification
	}

	/** Stable storage key for the current request. */
	public static function page_key() {
		if ( is_singular() ) {
			return 'post-' . get_queried_object_id();
		}
		if ( is_front_page() || is_home() ) {
			return 'home';
		}
		$path = wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/', PHP_URL_PATH ); // phpcs:ignore
		$path = untrailingslashit( $path ? $path : '/' );
		return 'url-' . md5( $path );
	}

	public static function setup() {
		if ( is_admin() || wp_doing_ajax() || is_feed() ) {
			return;
		}
		self::$key    = self::page_key();
		self::$page   = MS_Store::get_page( self::$key );
		self::$global = MS_Store::get_global();

		$frame = self::is_frame();
		if ( $frame ) {
			add_filter( 'show_admin_bar', '__return_false' );
		} elseif ( ! self::has_data( self::$page ) && ! self::has_data( self::$global ) ) {
			return; // Nothing to output on this page – zero overhead.
		}

		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ), 20 );
		add_action( 'wp_head', array( __CLASS__, 'head' ), 99 );
	}

	private static function has_data( $d ) {
		return ! empty( $d['rules'] ) || ! empty( $d['ops'] ) || ! empty( $d['connectors'] ) || ! empty( $d['css'] ) || array_filter( (array) $d['site'] );
	}

	public static function enqueue() {
		$frame = self::is_frame();

		wp_enqueue_style( 'motion-studio-runtime', MS_URL . 'assets/runtime.css', array(), MS_VERSION );
		wp_enqueue_script( 'motion-studio-runtime', MS_URL . 'assets/runtime.js', array(), MS_VERSION, true );

		$fonts = array_merge( (array) self::$global['fonts'], (array) self::$page['fonts'] );
		if ( $fonts && ! $frame ) {
			wp_enqueue_style( 'motion-studio-fonts', MS_Store::fonts_url( $fonts ), array(), null ); // phpcs:ignore
		}

		// Runtime only needs behaviour, not styles (styles are already in the CSS).
		$runtime_rules = array();
		foreach ( array_merge( self::$global['rules'], self::$page['rules'] ) as $r ) {
			unset( $r['style'], $r['text'], $r['label'] );
			$behaviour = array( 'content', 'anim', 'fx', 'loop', 'link', 'menu', 'popup', 'video', 'countdown', 'search' );
			if ( array_filter( array_intersect_key( $r, array_flip( $behaviour ) ) ) ) {
				$runtime_rules[] = $r;
			}
		}

		$data = array(
			'frame'    => $frame,
			'home'     => esc_url_raw( home_url( '/' ) ),
			'restRoot' => esc_url_raw( rest_url() ),
			'rules'    => $frame ? array() : $runtime_rules,
			'settings'   => MS_Store::settings(),
			'ops'        => $frame ? array() : array_merge( (array) self::$global['ops'], (array) self::$page['ops'] ),
			'connectors' => $frame ? array() : array_merge( (array) self::$global['connectors'], (array) self::$page['connectors'] ),
			'site'       => $frame ? array() : (object) self::$global['site'],
		);
		if ( $frame ) {
			$data['pageKey'] = self::$key;
			$data['title']   = wp_get_document_title();
			$data['page']    = self::$page;
			$data['global']  = self::$global;
		}
		wp_add_inline_script( 'motion-studio-runtime', 'window.MS_DATA=' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ';', 'before' );
	}

	public static function head() {
		if ( self::is_frame() ) {
			return; // Editor injects live CSS itself.
		}
		// "ms-js" enables the anti-flash rules (elements waiting for their entrance animation).
		// Fallback: if the runtime never loads, show everything after 3s.
		echo "<script>document.documentElement.classList.add('ms-js');setTimeout(function(){if(!window.MotionStudioRuntime)document.documentElement.classList.remove('ms-js')},3000);</script>\n";
		$css = MS_Store::clean_css( trim( self::$global['css'] . "\n" . self::$page['css'] ) );
		if ( '' !== $css ) {
			echo '<style id="motion-studio-css">' . $css . "</style>\n"; // phpcs:ignore WordPress.Security.EscapeOutput -- sanitized on save (no "<").
		}
	}

	public static function admin_bar( $bar ) {
		if ( is_admin() || ! current_user_can( MS_CAP ) ) {
			return;
		}
		// Build the address from the configured site URL, never from the (spoofable) Host header.
		$home   = wp_parse_url( home_url() );
		$scheme = ( isset( $home['scheme'] ) ? $home['scheme'] : 'http' ) . '://';
		$host   = ( isset( $home['host'] ) ? $home['host'] : '' ) . ( isset( $home['port'] ) ? ':' . $home['port'] : '' );
		$uri    = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/'; // phpcs:ignore
		$uri    = '/' . ltrim( preg_replace( '/[\x00-\x1F\x7F\s]/', '', (string) $uri ), '/\\' );
		$bar->add_node(
			array(
				'id'    => 'motion-studio',
				'title' => '<span class="ab-icon dashicons dashicons-art" style="top:2px"></span>' . esc_html__( 'Edit with Motion Studio', 'motion-studio' ),
				'href'  => MS_Editor::editor_url( $scheme . $host . $uri ),
			)
		);
	}
}

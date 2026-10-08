<?php
/**
 * Storage layer: per-page data, global data (all pages), revisions, settings.
 *
 * Data shape (both page + global):
 * [ 'rules' => [ ...rule objects... ], 'css' => 'generated css', 'fonts' => [ 'Poppins:400;700' ] ]
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class MS_Store {

	const MAX_REVISIONS = 10;

	public static function default_settings() {
		return array(
			'reduced' => 1,   // respect prefers-reduced-motion.
			'mobile'  => 1,   // run animations on phones.
			'offset'  => 0.15,
		);
	}

	public static function settings() {
		return wp_parse_args( (array) get_option( 'ms_settings', array() ), self::default_settings() );
	}

	public static function empty_data() {
		return array( 'rules' => array(), 'ops' => array(), 'connectors' => array(), 'css' => '', 'fonts' => array(), 'theme' => array(), 'site' => array() );
	}

	public static function get_page( $key ) {
		$data = get_option( 'ms_page_' . sanitize_key( $key ) );
		return is_array( $data ) ? wp_parse_args( $data, self::empty_data() ) : self::empty_data();
	}

	public static function get_global() {
		$data = get_option( 'ms_global' );
		return is_array( $data ) ? wp_parse_args( $data, self::empty_data() ) : self::empty_data();
	}

	public static function save_page( $key, $data, $meta = array() ) {
		$key = sanitize_key( $key );
		self::push_revision( 'ms_rev_' . $key, self::get_page( $key ) );
		update_option( 'ms_page_' . $key, $data, false );

		$index         = (array) get_option( 'ms_index', array() );
		$index[ $key ] = array(
			'url'     => isset( $meta['url'] ) ? esc_url_raw( $meta['url'] ) : '',
			'title'   => isset( $meta['title'] ) ? sanitize_text_field( $meta['title'] ) : $key,
			'rules'   => count( $data['rules'] ),
			'updated' => time(),
		);
		if ( empty( $data['rules'] ) ) {
			unset( $index[ $key ] );
		}
		update_option( 'ms_index', $index, false );
	}

	public static function save_global( $data ) {
		self::push_revision( 'ms_rev__global', self::get_global() );
		update_option( 'ms_global', $data, true );
	}

	private static function push_revision( $option, $previous ) {
		if ( empty( $previous['rules'] ) ) {
			return;
		}
		$revs = (array) get_option( $option, array() );
		array_unshift( $revs, array( 'time' => time(), 'data' => $previous ) );
		update_option( $option, array_slice( $revs, 0, self::MAX_REVISIONS ), false );
	}

	public static function revisions( $key ) {
		return (array) get_option( 'ms_rev_' . sanitize_key( $key ), array() );
	}

	public static function restore( $key, $index ) {
		$revs = self::revisions( $key );
		if ( ! isset( $revs[ $index ]['data'] ) ) {
			return false;
		}
		if ( '_global' === $key ) {
			self::save_global( $revs[ $index ]['data'] );
		} else {
			$idx  = (array) get_option( 'ms_index', array() );
			$meta = isset( $idx[ $key ] ) ? $idx[ $key ] : array();
			self::save_page( $key, $revs[ $index ]['data'], $meta );
		}
		return true;
	}

	public static function reset( $key ) {
		$key = sanitize_key( $key );
		if ( '_global' === $key ) {
			self::save_global( self::empty_data() );
			return;
		}
		self::save_page( $key, self::empty_data() );
	}

	/* ------------------------------------------------------------------
	 * Sanitizing incoming editor data.
	 * ---------------------------------------------------------------- */

	public static function sanitize_data( $raw ) {
		$out = self::empty_data();
		if ( ! is_array( $raw ) ) {
			return $out;
		}
		if ( ! empty( $raw['rules'] ) && is_array( $raw['rules'] ) ) {
			foreach ( array_slice( $raw['rules'], 0, 1000 ) as $rule ) {
				$clean = self::sanitize_rule( $rule );
				if ( $clean ) {
					$out['rules'][] = $clean;
				}
			}
		}
		if ( ! empty( $raw['ops'] ) && is_array( $raw['ops'] ) ) {
			foreach ( array_slice( $raw['ops'], 0, 500 ) as $op ) {
				$clean = self::sanitize_op( $op );
				if ( $clean ) {
					$out['ops'][] = $clean;
				}
			}
		}
		if ( ! empty( $raw['connectors'] ) && is_array( $raw['connectors'] ) ) {
			foreach ( array_slice( $raw['connectors'], 0, 200 ) as $c ) {
				if ( ! is_array( $c ) || empty( $c['from'] ) || empty( $c['to'] ) ) {
					continue;
				}
				$from      = self::clean_selector( $c['from'] );
				$to        = self::clean_selector( $c['to'] );
				$c         = self::deep_clean( $c );
				$c['from'] = $from;
				$c['to']   = $to;
				$out['connectors'][] = $c;
			}
		}
		foreach ( array( 'theme', 'site' ) as $k ) {
			if ( ! empty( $raw[ $k ] ) && is_array( $raw[ $k ] ) ) {
				$out[ $k ] = self::deep_clean( $raw[ $k ] );
			}
		}
		if ( isset( $raw['css'] ) && is_string( $raw['css'] ) ) {
			// Never allow breaking out of the <style> tag.
			$out['css'] = str_replace( '<', '', $raw['css'] );
		}
		if ( ! empty( $raw['fonts'] ) && is_array( $raw['fonts'] ) ) {
			foreach ( $raw['fonts'] as $f ) {
				if ( is_string( $f ) && preg_match( '/^[A-Za-z0-9 ]{2,40}:[0-9;]{3,40}$/', $f ) ) {
					$out['fonts'][] = $f;
				}
			}
			$out['fonts'] = array_values( array_unique( $out['fonts'] ) );
		}
		return $out;
	}

	private static function clean_selector( $sel ) {
		return trim( preg_replace( '/[<{};]/', '', (string) $sel ) );
	}

	/** HTML from the editor: admins with unfiltered_html keep everything, others get wp_kses_post. */
	private static function clean_html( $html ) {
		return current_user_can( 'unfiltered_html' ) ? (string) $html : wp_kses_post( (string) $html );
	}

	private static function sanitize_op( $op ) {
		if ( ! is_array( $op ) || empty( $op['id'] ) || ! preg_match( '/^msb-[a-z0-9]{3,20}$/', (string) $op['id'] ) ) {
			return null;
		}
		$t   = ( isset( $op['t'] ) && 'move' === $op['t'] ) ? 'move' : 'insert';
		$pos = isset( $op['pos'] ) && in_array( $op['pos'], array( 'before', 'after', 'prepend', 'append' ), true ) ? $op['pos'] : 'after';
		$out = array(
			'id'     => $op['id'],
			't'      => $t,
			'anchor' => self::clean_selector( isset( $op['anchor'] ) ? $op['anchor'] : 'body' ),
			'pos'    => $pos,
		);
		if ( 'move' === $t ) {
			$out['from'] = self::clean_selector( isset( $op['from'] ) ? $op['from'] : '' );
			if ( '' === $out['from'] ) {
				return null;
			}
		} else {
			$out['html'] = self::clean_html( isset( $op['html'] ) ? $op['html'] : '' );
		}
		if ( ! empty( $op['label'] ) ) {
			$out['label'] = sanitize_text_field( $op['label'] );
		}
		return $out;
	}

	private static function sanitize_rule( $rule ) {
		if ( ! is_array( $rule ) || empty( $rule['selector'] ) || ! is_string( $rule['selector'] ) ) {
			return null;
		}
		$rule['selector'] = self::clean_selector( $rule['selector'] );
		if ( '' === $rule['selector'] ) {
			return null;
		}
		if ( isset( $rule['content'] ) && is_array( $rule['content'] ) ) {
			$c = $rule['content'];
			$rule['content'] = array_filter(
				array(
					'html'   => isset( $c['html'] ) ? self::clean_html( $c['html'] ) : null,
					'src'    => isset( $c['src'] ) ? esc_url_raw( $c['src'] ) : null,
					'alt'    => isset( $c['alt'] ) ? sanitize_text_field( $c['alt'] ) : null,
					'href'   => isset( $c['href'] ) ? esc_url_raw( $c['href'] ) : null,
					'target' => isset( $c['target'] ) ? ( '_blank' === $c['target'] ? '_blank' : '_self' ) : null,
				),
				function ( $v ) {
					return null !== $v;
				}
			);
		}
		// Everything else is plain scalar config: strip tags recursively.
		$extra       = array( 'link', 'menu', 'header', 'frame', 'icon', 'popup', 'countdown', 'video' );
		$link_target = isset( $rule['link']['target'] ) && is_string( $rule['link']['target'] ) ? self::clean_selector( $rule['link']['target'] ) : null;
		foreach ( array_merge( array( 'style', 'text', 'anim', 'loop', 'fx', 'label', 'scope', 'id' ), $extra ) as $k ) {
			if ( isset( $rule[ $k ] ) ) {
				$rule[ $k ] = self::deep_clean( $rule[ $k ] );
			}
		}
		if ( null !== $link_target && is_array( $rule['link'] ) ) {
			$rule['link']['target'] = $link_target;
		}
		$allowed = array_merge( array( 'id', 'selector', 'label', 'scope', 'content', 'style', 'text', 'anim', 'loop', 'fx' ), $extra );
		return array_intersect_key( $rule, array_flip( $allowed ) );
	}

	private static function deep_clean( $v ) {
		if ( is_array( $v ) ) {
			$o = array();
			foreach ( $v as $k => $item ) {
				$o[ is_int( $k ) ? $k : preg_replace( '/[^A-Za-z0-9_\-]/', '', $k ) ] = self::deep_clean( $item );
			}
			return $o;
		}
		if ( is_bool( $v ) || is_int( $v ) || is_float( $v ) || null === $v ) {
			return $v;
		}
		return str_replace( array( '<', '>', '{', '}' ), '', wp_strip_all_tags( (string) $v ) );
	}

	/** Google Fonts stylesheet URL for a list of "Family:400;700" entries. */
	public static function fonts_url( $fonts ) {
		if ( empty( $fonts ) ) {
			return '';
		}
		$families = array();
		foreach ( array_unique( $fonts ) as $f ) {
			list( $name, $weights ) = array_pad( explode( ':', $f, 2 ), 2, '400' );
			$families[]             = 'family=' . str_replace( ' ', '+', $name ) . ':wght@' . $weights;
		}
		return 'https://fonts.googleapis.com/css2?' . implode( '&', $families ) . '&display=swap';
	}
}

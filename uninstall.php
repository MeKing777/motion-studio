<?php
/**
 * Runs when the plugin is deleted from the Plugins screen.
 * Data is only removed if "Delete all Motion Studio data" is ticked in Motion Studio → Settings.
 */
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$ms_settings = get_option( 'ms_settings' );
if ( ! is_array( $ms_settings ) || empty( $ms_settings['delete_data'] ) ) {
	return;
}

global $wpdb;
// phpcs:ignore WordPress.DB.DirectDatabaseQuery
$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE 'ms\\_page\\_%' OR option_name LIKE 'ms\\_rev\\_%' OR option_name IN ('ms_global','ms_index','ms_settings') OR option_name LIKE '\\_transient\\_ms\\_notice\\_%' OR option_name LIKE '\\_transient\\_timeout\\_ms\\_notice\\_%'" );

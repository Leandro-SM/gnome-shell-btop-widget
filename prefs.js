import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class BtopWidgetPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: _('Posição do Widget'),
        });
        page.add(group);

        const marginXRow = new Adw.SpinRow({
            title: _('Margem horizontal (px)'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 4000,
                step_increment: 10,
            }),
        });
        group.add(marginXRow);
        settings.bind('margin-x', marginXRow, 'value', Gio.SettingsBindFlags.DEFAULT);

        const marginYRow = new Adw.SpinRow({
            title: _('Margem vertical (px)'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 4000,
                step_increment: 10,
            }),
        });
        group.add(marginYRow);
        settings.bind('margin-y', marginYRow, 'value', Gio.SettingsBindFlags.DEFAULT);

        window.add(page);
    }
}

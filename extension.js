/* extension.js
 *
 * Btop Widget - exibe um widget de terminal estilo btop na área de trabalho.
 * Compatível com GNOME Shell 45+ (GJS ESM) e Wayland.
 */

import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const REFRESH_SECONDS = 2;

export default class BtopWidgetExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        this._container = new St.Bopin({
            style_class: 'btop-widget-container',
            reactive: false,
            can_focus: false,
            track_hover: false,
            x_expand: false,
            y_expand: false,
        });

        this._label = new St.Label({
            style_class: 'btop-widget-label',
            text: 'Carregando btop...',
        });
        this._label.clutter_text.set_line_wrap(false);
        this._label.clutter_text.set_ellipsize(0);

        this._container.set_child(this._label);

        // Ancorar o widget no fundo da tela (layer de background).
        Main.layoutManager._backgroundGroup.add_child(this._container);
        this._positionWidget();

        this._monitorChangedId = Main.layoutManager.connect(
            'monitors-changed',
            () => this._positionWidget()
        );

        this._updateOutput();
        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            REFRESH_SECONDS,
            () => {
                this._updateOutput();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    _positionWidget() {
        const monitor = Main.layoutManager.primaryMonitor;
        if (!monitor)
            return;

        const marginX = this._settings.get_int('margin-x');
        const marginY = this._settings.get_int('margin-y');

        this._container.set_position(
            monitor.x + marginX,
            monitor.y + marginY
        );
    }

    _updateOutput() {
        try {
            const proc = Gio.Subprocess.new(
                ['btop', '--utf-force', '--preset', '0', '--snapshot'],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );

            proc.communicate_utf8_async(null, null, (p, res) => {
                try {
                    const [, stdout] = p.communicate_utf8_finish(res);
                    if (stdout)
                        this._label.set_text(this._stripAnsi(stdout));
                } catch (e) {
                    this._label.set_text('Erro ao ler btop: ' + e.message);
                }
            });
        } catch (e) {
            this._label.set_text('btop não encontrado. Instale com: sudo apt install btop');
        }
    }

    _stripAnsi(text) {
        // Remove sequências de escape ANSI para exibição em St.Label.
        return text.replace(/\x1b\[[0-9;]*m/g, '');
    }

    disable() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }

        if (this._monitorChangedId) {
            Main.layoutManager.disconnect(this._monitorChangedId);
            this._monitorChangedId = null;
        }

        if (this._container) {
            this._container.destroy();
            this._container = null;
        }

        this._label = null;
        this._settings = null;
    }
}

/* extension.js
 *
 * Btop Widget - extensão do GNOME Shell (Ubuntu/Wayland).
 *
 * ARQUITETURA (variante A1):
 * O btop é uma TUI interativa e o VTE (emulador de terminal) é um widget GTK,
 * que NÃO pode ser embutido no processo do gnome-shell (Clutter/St). Por isso,
 * esta extensão NÃO renderiza o btop diretamente: ela gerencia o CICLO DE VIDA
 * de um app auxiliar GTK4+VTE (btop-widget-app.js) que abre uma janela sem
 * decoração rodando o btop real.
 *
 *   enable()  -> lança o app auxiliar (Gio.Subprocess)
 *   disable() -> encerra o app auxiliar
 */

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class BtopWidgetExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._proc = null;
        this._launchWidget();
    }

    _launchWidget() {
        const appScript = GLib.build_filenamev([this.path, 'btop-widget-app.js']);

        try {
            this._proc = Gio.Subprocess.new(
                ['gjs', appScript],
                Gio.SubprocessFlags.NONE
            );

            // Quando o processo auxiliar termina, limpa a referência.
            this._proc.wait_async(null, (proc, res) => {
                try {
                    proc.wait_finish(res);
                } catch (e) {
                    // Ignorado: normalmente ocorre ao encerrar via force_exit.
                }
                this._proc = null;
            });
        } catch (e) {
            logError(e, 'Btop Widget: falha ao lançar o app auxiliar');
        }
    }

    disable() {
        if (this._proc) {
            try {
                this._proc.force_exit();
            } catch (e) {
                // Processo pode já ter saído.
            }
            this._proc = null;
        }

        this._settings = null;
    }
}

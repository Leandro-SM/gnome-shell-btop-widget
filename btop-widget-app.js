#!/usr/bin/env gjs
/* btop-widget-app.js
 *
 * Aplicação auxiliar GTK4 + VTE que renderiza o btop real dentro de uma
 * janela sem decoração, com aparência de "widget de área de trabalho".
 *
 * A extensão do GNOME Shell (extension.js) é responsável por lançar e
 * encerrar este processo. Este app é intencionalmente separado porque o
 * VTE é um widget GTK e NÃO pode ser embutido no processo do gnome-shell
 * (que usa Clutter/St, um toolkit incompatível com GTK).
 *
 * Uso:
 *   gjs btop-widget-app.js [--command "btop --force-utf"]
 *
 * Observações sobre Wayland:
 *   - No Wayland, o cliente não controla a posição absoluta da janela nem
 *     consegue forçar-se ao "fundo" do desktop (limitação do protocolo).
 *   - O resultado é uma janela de terminal sem bordas; o posicionamento
 *     fino depende do compositor.
 */

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';
import Vte from 'gi://Vte?version=3.91';
import Gdk from 'gi://Gdk?version=4.0';
import Pango from 'gi://Pango';

// Comando padrão a ser executado no terminal embutido.
// Usa a flag CORRETA do btop: --force-utf (não --utf-force).
const DEFAULT_COMMAND = ['btop', '--force-utf'];

function parseCommand(argv) {
    const idx = argv.indexOf('--command');
    if (idx !== -1 && argv[idx + 1])
        return GLib.shell_parse_argv(argv[idx + 1])[1];
    return DEFAULT_COMMAND;
}

const application = new Gtk.Application({
    application_id: 'io.github.leandro_sm.BtopWidget',
    flags: Gio.ApplicationFlags.HANDLES_COMMAND_LINE,
});

let commandToRun = DEFAULT_COMMAND;

application.connect('command-line', (app, commandLine) => {
    const argv = commandLine.get_arguments();
    commandToRun = parseCommand(argv);
    app.activate();
    return 0;
});

application.connect('activate', () => {
    const window = new Gtk.ApplicationWindow({
        application,
        title: 'btop-widget',
        decorated: false,
        default_width: 900,
        default_height: 500,
    });

    // Marca a janela para comportar-se como um utilitário/widget.
    window.add_css_class('btop-widget-window');

    const terminal = new Vte.Terminal({
        hexpand: true,
        vexpand: true,
        // Sem scrollback: é um monitor ao vivo.
        scrollback_lines: 0,
        // Sem interação de rolagem/entrada acidental.
        input_enabled: false,
    });

    // Fonte monoespaçada para preservar a arte do btop.
    terminal.set_font(Pango.FontDescription.from_string('monospace 11'));

    // Lança o btop dentro do terminal.
    terminal.spawn_async(
        Vte.PtyFlags.DEFAULT,
        GLib.get_home_dir(),
        commandToRun,
        null,
        GLib.SpawnFlags.SEARCH_PATH,
        null,
        -1,
        null,
        (term, pid, error) => {
            if (error !== null)
                logError(error, 'Falha ao iniciar o btop no VTE');
        }
    );

    // Se o btop sair, encerra o app auxiliar.
    terminal.connect('child-exited', () => application.quit());

    window.set_child(terminal);
    window.present();
});

application.runAsync([programInvocationName].concat(ARGV));

# Btop Widget

Extensão do **GNOME Shell** que exibe o **btop** real como um widget de terminal na área de trabalho, pensada para **Ubuntu** rodando em **Wayland**.

## Arquitetura

O `btop` é uma **TUI interativa** e o **VTE** (emulador de terminal) é um **widget GTK**, que **não pode ser embutido** no processo do `gnome-shell` (que usa Clutter/St). Por isso a extensão adota o seguinte desenho:

- **`btop-widget-app.js`** — aplicação auxiliar **GTK4 + VTE** que abre uma janela sem decoração rodando o `btop` real (com cores, gráficos e animações genuínos).
- **`extension.js`** — gerencia o **ciclo de vida** do app auxiliar: lança no `enable()` e encerra no `disable()`.

```
┌──────────────────────┐        lança/encerra        ┌───────────────────────────┐
│  extension.js        │ ──────────────────────────► │  btop-widget-app.js       │
│  (GNOME Shell / St)  │        (Gio.Subprocess)     │  (GTK4 + VTE → btop)      │
└──────────────────────┘                             └───────────────────────────┘
```

## Requisitos

- GNOME Shell 45, 46 ou 47
- `btop`:
  ```bash
  sudo apt install btop
  ```
- **GJS**, **GTK 4** e **VTE 3.91** (introspecção):
  ```bash
  sudo apt install gjs gir1.2-gtk-4.0 gir1.2-vte-3.91
  ```

## ⚠️ Limitações no Wayland

No **Wayland**, uma aplicação cliente **não controla a posição absoluta** da própria janela nem consegue forçar-se ao "fundo" do desktop como no X11 — isso é uma restrição do protocolo, não da extensão. O GNOME/Mutter **não** implementa `wlr-layer-shell`.

Consequência: o widget aparece como uma **janela de terminal sem bordas**, e o posicionamento fino/"colar no wallpaper" depende do compositor. Em X11 o comportamento tende a ser mais próximo de um widget de desktop tradicional.

## Instalação (manual)

```bash
git clone https://github.com/Leandro-SM/gnome-shell-btop-widget.git
cd gnome-shell-btop-widget
cp -r . ~/.local/share/gnome-shell/extensions/btop-widget@leandro-sm.github.io/

glib-compile-schemas ~/.local/share/gnome-shell/extensions/btop-widget@leandro-sm.github.io/schemas/

# Reinicie a sessão (no Wayland: logout/login) e ative:
gnome-extensions enable btop-widget@leandro-sm.github.io
```

### Testar o app auxiliar isoladamente

Antes de ativar a extensão, você pode validar o app GTK+VTE sozinho:

```bash
gjs btop-widget-app.js
```

## Estrutura

| Arquivo | Descrição |
|---------|-----------|
| `extension.js` | Gerencia o ciclo de vida do app auxiliar |
| `btop-widget-app.js` | App GTK4+VTE que roda o btop real |
| `prefs.js` | Janela de preferências (posição) |
| `stylesheet.css` | Estilo (aplicável à parte St da extensão) |
| `metadata.json` | Metadados da extensão |
| `schemas/` | Schema GSettings |

## Licença

MIT

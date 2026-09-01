# Btop Widget

Extensão do **GNOME Shell** que exibe um widget de terminal estilo **btop** ancorado na área de trabalho, pensada para **Ubuntu** rodando em **Wayland**.

O widget renderiza a saída do `btop` em um painel translúcido sobre o papel de parede, com atualização periódica.

## Requisitos

- GNOME Shell 45, 46 ou 47
- [`btop`](https://github.com/aristocratos/btop) instalado:

```bash
sudo apt install btop
```

## Instalação (manual)

```bash
git clone https://github.com/Leandro-SM/gnome-shell-btop-widget.git
cd gnome-shell-btop-widget
cp -r . ~/.local/share/gnome-shell/extensions/btop-widget@leandro-sm.github.io/

# Compilar o schema de configurações
glib-compile-schemas ~/.local/share/gnome-shell/extensions/btop-widget@leandro-sm.github.io/schemas/

# Reinicie a sessão (no Wayland: logout/login) e ative:
gnome-extensions enable btop-widget@leandro-sm.github.io
```

## Configuração

Abra as preferências para ajustar a posição do widget:

```bash
gnome-extensions prefs btop-widget@leandro-sm.github.io
```

## Estrutura

| Arquivo | Descrição |
|---------|-----------|
| `extension.js` | Lógica principal: criação, posicionamento e atualização do widget |
| `prefs.js` | Janela de preferências (posição) |
| `stylesheet.css` | Estilo do painel do widget |
| `metadata.json` | Metadados da extensão |
| `schemas/` | Schema GSettings |

## Licença

MIT

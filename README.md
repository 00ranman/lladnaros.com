# lladnaros.com

Music-first carnival site for **Lladnaros**. Layer 1 is the ring. Layer 2 is the engine under the boards.

The site is a static SPA. One page, hash rooms, one YouTube player session so **Weaponized Transparency** (and any docked video) does not restart when you walk to another tent.

## Rooms

| key | room | layer |
|---|---|---|
| 1 | The Ring | L1 music |
| 2 | Catalog | L1 albums / singles |
| 3 | Notebook | L1 book + cipher |
| 4 | L2 Engine | systems, repos, papers |
| 5 | Box Office | follow / tip |

Keys: `1–5` rooms · `M` mute · `Esc` leave cinema / close map.

Enter is theatrical login. Clicking **ENTER THE RING** is the user gesture that unlocks autoplay.

## Stack

Plain HTML / CSS / JS. No build step. YouTube IFrame API for the persistent stage.

## Deploy — GitHub Pages (preview)

1. Repo: `https://github.com/00ranman/lladnaros.com`
2. Settings → Pages → Deploy from branch `main` / root
3. Site will be at `https://00ranman.github.io/lladnaros.com/`

Optional custom domain: `CNAME` already contains `lladnaros.com`. Point DNS after you are ready to cut over from Hostinger.

## Deploy — Hostinger (current host)

Hostinger can pull this repo so updates are `git push`.

1. hPanel → Advanced → **Git** (or Website → Git)
2. Connect GitHub, select `00ranman/lladnaros.com`, branch `main`
3. Deploy directory = public_html (or the folder that currently serves lladnaros.com)
4. After each push, trigger deploy (or enable auto-deploy)

If Git in hPanel is unavailable, download the repo ZIP and upload, or:

```bash
git clone https://github.com/00ranman/lladnaros.com.git
# rsync / FTP the files into public_html
```

Keep the old pages (`/docs`, `/universaltimes.html`, `/proof-layers.html`, `/start/`) on Hostinger until you migrate them into this repo. This carnival links out to those URLs.

## Local

Open `index.html` over a tiny server (YouTube embed is happier than `file://`):

```bash
python3 -m http.server 8080
```

## Edit without a build

- Copy: `index.html`
- Look: `styles.css`
- Behavior: `app.js` (`VIDEO.featured` is the YouTube id)

Swap the featured video by changing `70jZG8p1h1w` in `app.js`.

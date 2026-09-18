# Rendre myacademicwebsite bilingue (EN par défaut / FR)

## Ce qui est inclus dans ce zip

- `config.yml` — remplace ton fichier à la racine du projet.
- `content/archive.fr.md`, `content/contributions/_index.fr.md`,
  `content/papers/_index.fr.md`, `content/papers/paper1/index.fr.md`,
  `content/teaching/_index.fr.md`, `content/tags/_index.fr.md` — un
  placeholder par page anglaise existante. (`location.md` et
  `officehours.md` ont été retirés de ce zip puisque tu les as supprimés
  du site.) Place chacun **au même endroit** que son équivalent anglais
  dans `content/` (mêmes dossiers, juste `.fr.md` au lieu de `.md`).
- `i18n/en.yaml` et `i18n/fr.yaml` — remplacent la version précédente
  (nouvelles clés `frenchLabel` / `englishLabel` pour le sélecteur de langue).
- `layouts/partials/index_profile.html` — remplace ton fichier
  existant. C'est le template de ta page d'accueil (mode "profil").
- `layouts/partials/header.html` — **remplace** ton fichier existant.
  Utilise maintenant le nouveau sélecteur de langue (voir plus bas).
- `layouts/partials/lang_switch.html` — **nouveau** fichier. Le
  sélecteur de langue lui-même (voir plus bas), réutilisé à la fois dans
  l'en-tête et sous ton nom sur la page d'accueil.
- `assets/css/common/header.css` — remplace ton fichier existant.
  Ajoute le style de l'état actif du sélecteur de langue.
- `layouts/shortcodes/timeline.html` — remplace ton fichier
  existant. C'est le shortcode `{{< timeline >}}` de ta page contributions.

## Pourquoi `.fr.md` ?

Hugo associe automatiquement `archive.md` (anglais, langue par défaut)
et `archive.fr.md` (français) parce qu'ils partagent le même nom de
fichier, seule la partie langue change. C'est ce qui permet :
- au sélecteur de langue du thème PaperMod de fonctionner,
- à chaque page anglaise de pointer vers sa traduction correspondante.

## Ce que j'ai fait dans `config.yml`

- `defaultContentLanguage: en` + `defaultContentLanguageInSubdir: false`
  → l'anglais reste à `janettemujica.github.io/myacademicwebsite/`,
  le français sera à `.../myacademicwebsite/fr/`.
- Le menu principal (`papers / contributions / teaching`) et tout le
  **mode profil** de la page d'accueil (titre, sous-titre, bio, boutons)
  sont maintenant définis séparément sous `languages.en` et
  `languages.fr`, car ce texte diffère par langue.
- Le contenu français que tu as fourni (menu, sous-titre, bio) a été
  intégré tel quel dans `languages.fr.params.profileMode`.
- J'ai rédigé moi-même la meta-description française (`languages.fr.params.description`)
  puisqu'elle n'était pas dans ta traduction — relis-la et ajuste si besoin.
- `params.displayFullLangName: false` → le sélecteur de langue de
  PaperMod affichera des codes courts (EN / FR). Passe-le à `true` si tu
  préfères "English" / "Français" en toutes lettres.
- Tout ce qui est identique dans les deux langues (icônes sociales,
  réglages d'affichage, `markup`, etc.) reste dans le bloc `params:`
  global, en bas du fichier.

## Nouveau sélecteur de langue

Avant, le sélecteur de langue dans l'en-tête n'affichait qu'**un seul
lien discret** vers "l'autre" langue (par ex. juste "FR" quand tu étais
en anglais). C'est ce qui le rendait facile à manquer, et il n'apparaissait
que dans le header — jamais visible sur ta page d'accueil autrement
qu'en haut de l'écran.

Nouveau comportement :
- Les **deux langues sont toujours affichées ensemble**, dans le même
  ordre : `FR / ENG` (page anglaise) ou `FR / ANG` (page française).
- La langue active est stylée **exactement comme l'onglet actif de ta
  navigation** (même soulignement rose, même graisse de police) au lieu
  d'être un simple lien.
- Le sélecteur apparaît maintenant **à deux endroits** :
  1. Dans l'en-tête (`header.html`), comme avant — mais amélioré.
  2. **Juste sous ton nom**, sur la page d'accueil (mode profil), grâce
     à un nouveau bloc ajouté dans `index_profile.html`.
- Les deux endroits réutilisent le même fichier
  `layouts/partials/lang_switch.html`, donc si tu veux ajuster le style
  ou l'emplacement plus tard, tu ne le fais qu'à un seul endroit.
- Les libellés ("ENG" en anglais, "ANG" en français) sont dans `i18n/en.yaml`
  et `i18n/fr.yaml` (`englishLabel`) si tu veux les changer plus tard.

## Nouveau : texte codé en dur trouvé dans tes layouts

En regardant `index_profile.html` et `timeline.html`, j'ai découvert que
plusieurs textes affichés sur la page d'accueil et dans la timeline des
contributions étaient **écrits en anglais directement dans le HTML**, et
pas dans `config.yml` comme le reste. C'est exactement le texte que tu
avais traduit dans ton Word ("Merci", la liste des bourses, "À propos de
moi et ma recherche") : sans ce correctif, ta traduction n'aurait eu
nulle part où s'accrocher. J'ai donc :

1. **Déplacé la section "Heartfelt thanks" / "Merci" dans `config.yml`**
   (`languages.<code>.params.profileMode.funding`), avec un `title`, un
   `subtitle` et une liste `items` (année, nom, lien optionnel, montant)
   — remplace la liste à puces qui était codée en dur. Le layout affiche
   maintenant cette liste dynamiquement, dans la bonne langue.
2. **Ajouté `profileMode.aboutTitle`** pour le titre "About me and my
   research" / "À propos de moi et ma recherche", lui aussi déplacé de
   `index_profile.html` vers `config.yml`.
3. **Créé `i18n/en.yaml` et `i18n/fr.yaml`** pour les petits bouts de
   texte d'interface qui ne sont pas vraiment "ton contenu" mais des
   libellés génériques : le bouton "papers" en bas de la page d'accueil
   (et son titre "Next: Papers"), le bouton de filtre "All" de la
   timeline, "Read more" / "Show less", "View details", et "With ... and"
   pour la liste des personnes citées dans une contribution.
4. **Corrigé un bug de lien** : le bouton "papers" en bas de la page
   d'accueil utilisait `absURL`, qui ignore la langue et pointait
   toujours vers la version anglaise de `/papers/`, même depuis `/fr/`.
   Il utilise maintenant `relLangURL`, qui respecte la langue courante.

Si tu ajoutes d'autres bourses/prix plus tard, fais-le directement dans
`config.yml` (sous `funding.items`, pour chaque langue) plutôt que dans
le HTML.

## L'image manquante sur la page "papers"

Tu m'as envoyé `content/papers/_index.md` (la page de **liste** des
articles), pas `content/papers/paper1/index.md` (l'article lui-même —
c'est probablement là que se trouve la référence à `paper1.png`, via un
champ `cover:` dans le front matter ou une image Markdown dans le corps
du texte). Sans ce fichier, je ne peux pas savoir comment l'image est
appelée ni pourquoi elle ne s'affiche pas côté français. Envoie-le moi
et je corrige ça dans le même mouvement.

## Ce que je n'ai PAS pu faire (je n'avais pas ces fichiers)

Je n'avais que `config.yml`, `project-hierarchy.txt` et ta traduction
Word — pas le contenu réel de `archive.md`, `contributions/_index.md`,
`papers/_index.md`,
`papers/paper1/index.md`, `teaching/_index.md`. J'ai donc créé des
placeholders avec juste le `title` (traduit) et un commentaire indiquant
où coller le texte anglais source. **Envoie-moi ces fichiers si tu veux
que je te prépare les vrais placeholders en anglais**, sinon copie
toi-même le contenu anglais dans chaque `.fr.md` avant de le traduire.

## Autres points à vérifier

1. **`data/contributions.yaml`** : si ce fichier contient du texte
   (titres, descriptions de tes contributions) affiché sur le site, il
   faudra soit :
   - créer `data/contributions.fr.yaml` et adapter le layout
     (`layouts/partials/...` ou le template qui lit `contributions.yaml`)
     pour choisir le bon fichier selon `.Site.Language.Lang`, soit
   - ajouter directement des champs `title_fr` / `description_fr` dans
     le même fichier et adapter le template pour choisir le bon champ.
   Envoie-moi ce fichier + le layout qui le consomme si tu veux que je
   fasse cette adaptation.

2. **Sélecteur de langue dans le header** : PaperMod affiche normalement
   un sélecteur de langue automatique dans l'en-tête dès qu'il détecte
   plusieurs langues (`.Site.Home.AllTranslations` / `len .Site.Languages`).
   Ton projet a **son propre** `layouts/partials/header.html` (copié du
   thème et personnalisé). Vérifie qu'il contient encore ce bloc — si tu
   l'as supprimé ou modifié en profondeur, le sélecteur pourrait ne pas
   s'afficher. Envoie-moi ce fichier si tu veux que je vérifie/corrige.

3. **`archetypes/paper.md` et `archetypes/teaching.md`** : ce sont des
   modèles utilisés par `hugo new`. Pas obligatoire de les traduire,
   mais tu peux créer `archetypes/paper.fr.md` avec un front matter par
   défaut en français si tu ajoutes régulièrement des articles bilingues.

4. **Étiquettes (`tags`)** : les tags comme `parkinson`, `co-design`,
   etc. resteront partagés tels quels entre les deux langues sauf si tu
   veux des étiquettes traduites (ex. `co-design` → `codesign` en
   français est probablement inutile, mais à toi de voir).

## Checklist rapide

- [ ] Copier `config.yml` à la racine du projet (remplace l'existant).
- [ ] Copier les fichiers `.fr.md` dans leurs dossiers respectifs sous `content/`
      (`papers/_index.fr.md` contient maintenant le vrai texte anglais à traduire).
- [ ] Copier `i18n/en.yaml` et `i18n/fr.yaml` dans `i18n/` à la racine du projet.
- [ ] Remplacer `layouts/partials/index_profile.html` par la nouvelle version.
- [ ] Remplacer `layouts/partials/header.html` par la nouvelle version.
- [ ] Ajouter `layouts/partials/lang_switch.html` (nouveau fichier).
- [ ] Remplacer `assets/css/common/header.css` par la nouvelle version.
- [ ] Remplacer `layouts/shortcodes/timeline.html` par la nouvelle version.
- [ ] Lancer `hugo server -D` en local et vérifier que `/fr/` fonctionne,
      que "FR / ENG" (ou "FR / ANG") apparaît bien dans l'en-tête ET sous
      ton nom sur la page d'accueil, avec la langue active soulignée, et
      que la page d'accueil (les deux langues) affiche bien la section
      "Merci"/"Heartfelt thanks" et son titre "About me"/"À propos de moi".
- [ ] M'envoyer `content/papers/paper1/index.md` pour corriger l'image manquante.
- [ ] Remplacer chaque placeholder par le vrai contenu anglais, puis le
      traduire en français.
- [ ] Vérifier/adapter `data/contributions.yaml` si besoin (voir point 1).
- [ ] Ajuster la meta-description française si tu veux un texte différent.

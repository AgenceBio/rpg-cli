# `@agencebio/rpg-cli` [![.github/workflows/main.yml](https://github.com/AgenceBio/rpg-cli/actions/workflows/main.yml/badge.svg)](https://github.com/AgenceBio/rpg-cli/actions/workflows/main.yml)

Transforme le Registre Parcellaire Graphique (RPG) Bio tel que communiqué par l'Agence de Services et de Paiement (ASP) en une version anonymisée — publiable en open data.

# Utilisation en ligne de commande

```sh
npm install
```

## Générer une ou plusieurs régions

Génère un fichier par région demandée.

```sh
npm run build -- --src /path/to/rpg-bio --millesime 2020 --region 75
npm run build -- --src /path/to/rpg-bio --millesime 2020 --region 75 --region 53
```

| Code | Libellé
| ---  | ---
| 01 | Guadeloupe
| 02 | Martinique
| 03 | Guyane
| 04 | La Réunion
| 06 | Mayotte
| 11 | Île-de-France
| 24 | Centre-Val de Loire
| 27 | Bourgogne-Franche-Comté
| 28 | Normandie
| 32 | Hauts-de-France
| 44 | Grand Est
| 52 | Pays de la Loire
| 53 | Bretagne
| 75 | Nouvelle-Aquitaine
| 76 | Occitanie
| 84 | Auvergne-Rhône-Alpes
| 93 | Provence-Alpes-Côte d'Azur
| 94 | Corse

<details>
  <summary>Commande pour générer ce tableau</summary>
  <pre><code>cat data/regions-avec-outre-mer.geojson| jq -r '.features | map({ code: .properties.code, label: .properties.nom }) | sort_by(.code) | map("| " + .code + " | " + .label) | join("\n")'</code></pre>
</details>

## Générer un ou plusieurs départements

Génère un fichier par département demandé.

```sh
npm run build -- --src /path/to/rpg-bio --millesime 2020 --departement 26
npm run build -- --src /path/to/rpg-bio --millesime 2020 --departement 26 --departement 07
```

| Code | Libellé
| ---  | ---
| 01 | Ain
| 02 | Aisne
| 03 | Allier
| 04 | Alpes-de-Haute-Provence
| 05 | Hautes-Alpes
| 06 | Alpes-Maritimes
| 07 | Ardèche
| 08 | Ardennes
| 09 | Ariège
| 10 | Aube
| 11 | Aude
| 12 | Aveyron
| 13 | Bouches-du-Rhône
| 14 | Calvados
| 15 | Cantal
| 16 | Charente
| 17 | Charente-Maritime
| 18 | Cher
| 19 | Corrèze
| 21 | Côte-d'Or
| 22 | Côtes-d'Armor
| 23 | Creuse
| 24 | Dordogne
| 25 | Doubs
| 26 | Drôme
| 27 | Eure
| 28 | Eure-et-Loir
| 29 | Finistère
| 2A | Corse-du-Sud
| 2B | Haute-Corse
| 30 | Gard
| 31 | Haute-Garonne
| 32 | Gers
| 33 | Gironde
| 34 | Hérault
| 35 | Ille-et-Vilaine
| 36 | Indre
| 37 | Indre-et-Loire
| 38 | Isère
| 39 | Jura
| 40 | Landes
| 41 | Loir-et-Cher
| 42 | Loire
| 43 | Haute-Loire
| 44 | Loire-Atlantique
| 45 | Loiret
| 46 | Lot
| 47 | Lot-et-Garonne
| 48 | Lozère
| 49 | Maine-et-Loire
| 50 | Manche
| 51 | Marne
| 52 | Haute-Marne
| 53 | Mayenne
| 54 | Meurthe-et-Moselle
| 55 | Meuse
| 56 | Morbihan
| 57 | Moselle
| 58 | Nièvre
| 59 | Nord
| 60 | Oise
| 61 | Orne
| 62 | Pas-de-Calais
| 63 | Puy-de-Dôme
| 64 | Pyrénées-Atlantiques
| 65 | Hautes-Pyrénées
| 66 | Pyrénées-Orientales
| 67 | Bas-Rhin
| 68 | Haut-Rhin
| 69 | Rhône
| 70 | Haute-Saône
| 71 | Saône-et-Loire
| 72 | Sarthe
| 73 | Savoie
| 74 | Haute-Savoie
| 75 | Paris
| 76 | Seine-Maritime
| 77 | Seine-et-Marne
| 78 | Yvelines
| 79 | Deux-Sèvres
| 80 | Somme
| 81 | Tarn
| 82 | Tarn-et-Garonne
| 83 | Var
| 84 | Vaucluse
| 85 | Vendée
| 86 | Vienne
| 87 | Haute-Vienne
| 88 | Vosges
| 89 | Yonne
| 90 | Territoire de Belfort
| 91 | Essonne
| 92 | Hauts-de-Seine
| 93 | Seine-Saint-Denis
| 94 | Val-de-Marne
| 95 | Val-d'Oise
| 971 | Guadeloupe
| 972 | Martinique
| 973 | Guyane
| 974 | La Réunion
| 976 | Mayotte

<details>
  <summary>Commande pour générer ce tableau</summary>
  <pre><code>cat data/departements-avec-outre-mer.geojson| jq -r '.features | map({ code: .properties.code, label: .properties.nom }) | sort_by(.code) | map("| " + .code + " | " + .label) | join("\n")'</code></pre>
</details>

### Update "Codes Cultures" data file

Once you get a new `.xlsx` file with the update crop codes,
run the folllowing command:

```sh
$ in2csv --no-inference /path/to/codes_culture20xx.xlsx \
  | csvcut --columns '1,2' --delete-empty-rows \
  | csvjson --indent 2 > data/cultures-et-precisions.json
```

Or, with a more complete CSV file:

```sh
$ csvjson --encoding windows-1252 --delimiter ';' --indent 2  --quoting 1 --no-inference \
  data/Codification_cultures_principales.csv \
  > data/cultures-et-precisions.json
```

# Licence

[GPL v3](./LICENSE)

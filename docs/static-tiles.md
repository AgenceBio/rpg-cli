# De Geoserver vers des fichiers statiques

Inspirations :

- [Interactive maps with static vector tiles](https://robertodip.com/blog/building-interactive-maps-with-statically-generated-vector-tiles/#build-static-tiles) de Rob Dip
- [README de `tippecanoe`](https://github.com/mapbox/tippecanoe)

## Obtention des RPG de l'ASP

🕰 Cette étape dure environ 5 minutes avec une connexion fibre.

```bash
wget --header='Cookie: user=…; password=…' https://echange.asp-public.fr/AgenceBio/SURFACES-2019-PARCELLES-GRAPHIQUES-CONSTATEES_20211012.zip
mkdir 2019 && cd 2019
mv ../SURFACES-2019-PARCELLES-GRAPHIQUES-CONSTATEES_20211012.zip .
unzip SURFACES-2019-PARCELLES-GRAPHIQUES-CONSTATEES_20211012.zip
rm SURFACES-2019-PARCELLES-GRAPHIQUES-CONSTATEES_20211012.zip
```

## Assemblage et conversion en GeoJSON

🕰 Cette étape dure environ 15 minutes.

On passe d'abord par du Geopackage, sans limite et plus rapide à concaténer.

```bash
rm rpg.gpkg
# ~5 minutes
for FILE in $(ls *.zip); do echo "Start $FILE…"; ogr2ogr -update -append -t_srs EPSG:3857 -nlt POLYGON -nln rpg rpg.gpkg "/vsizip/${FILE}"; done

# ~10 minutes
ogr2ogr rpg.geojson rpg.gpkg
```

## Transformation en tuiles vectorielles

🕰 Cette étape dure environ 24 minutes.

```bash
brew install tipeecanoe
```

En fichier unique :

```bash
tippecanoe -Z10 -z14 --extend-zooms-if-still-dropping --no-tile-compression --simplify-only-low-zooms --drop-densest-as-needed --output rpg-2021.mbtiles --projection EPSG:3857 --name
"RPG 2021" --layer "rpg2021"
--exclude NUM_ILOT --exclude NUM_PARCEL --exclude PACAGE --force rpg.geojson

MAPBOX_ACCESS_TOKEN=pk.….… npx @mapbox/mbview rpg-2019.mbtiles
```

En arbre de répertoires :

```bash
tippecanoe -Z10 -z14 --extend-zooms-if-still-dropping --no-tile-compression --simplify-only-low-zooms --drop-densest-as-needed --output-to-directory rpg-2021 --projection EPSG:3857
--name "RPG 2021" --layer
"rpg2021" --exclude NUM_ILOT --exclude NUM_PARCEL --exclude PACAGE --force rpg.geojson

npx http-server ./rpg-2021 --cors --port 5000 --gzip
```

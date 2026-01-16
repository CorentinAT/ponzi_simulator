# Pyramide de Ponzi simulator

Projet d'esthétique et algorithmique sur les fractales fait par Laïn et Corentin en IMAC1.

## Lancer le projet

[Version en ligne](https://ponzi.super-sympa.fr)

Avec npm :

```bash
npm install
npx vite
```

Avec Docker :

```bash
docker build -t ponzi-simulator .
docker run -p 80:80 ponzi-simulator
```

## PATCH 1.2 (vendredi)

Voici la liste des améliorations de vendredi :

- nombre d'étages maximum augmenté de 7 à 20, tous les 7 tours, l'ancienne pyramide s'imbrique dans une nouvelle pyramide qui change de couleur
- scoreboard : partagez votre highscore pour rentrer dans le prestigieux classement des plus grands escrocs de la planète !
- nouvelle variable : *l'influence*, qui multiplie l'apport en biff des investisseurs sans modifier leur coût
- tiers d'évènement : certains évènements n'apparaissent qu'à partir de la deuxième pyramide, pour éviter des parties trop courtes
- nouvel affichage qui calcule les propositions et affiche les données en rouge ou en vert selon leur valeur 
- scaling des données : au fur et à mesure des étages de la pyramide, les valeurs en coût et en apport sont de plus en plus grandes.
- plus d'évènements différents, des nouveaux investisseurs et un équilibrage général

## Explications

Ce simulateur vous met dans la peau d'un escroc en herbe avec des rêves de richesse pleins la tête.

En vous inspirant des plus grandes arnaques qui ont existé, vous décidez de créer une Pyramide de Ponzi à partir de vos fonds financiers personnels.

Vous êtes alors à la recherche d'investisseurs véreux, à qui vous promettez des taux d'intérêts très importants après leur investissement. Mais attention ! Ces investisseurs ne sont pas toujours très fiables et peuvent faire évoluer votre rendement dans le bon sens, ou dans le mauvais...

Grâce à ces investisseurs, votre organisation pourra toucher de nouvelles personnes, recruter de nouveaux membres qui pourront à nouveau en amener dans la boucle, pour former une véritable pyramide.

À vous de saisir les bonnes opportunités pour faire évoluer votre business et pouvoir partir, laissant sans nouvelles vos fidèles membres et investisseurs, avec un maximum d'argent.

Faites également attention aux évènements extérieurs, qui peuvent avoir un impact direct et fort sur votre organisation.

> [!NOTE]  
> N'hésitez pas à enchaîner les parties pour tenter de faire le meilleur score possible et découvrir les différents investisseurs et évènements !

## Crédits

- Bernard Madoff : inspiration
- ChatGPT : aide à la première prise en main de ThreeJS

#!/usr/bin/env python3
"""Generate hosted association SVGs + SQL seed (wave 2)."""
from pathlib import Path

ROOT = Path("/workspace")
ORGS_DIR = ROOT / "public" / "orgs"
SQL_PATH = ROOT / "migrations" / "0006_hosted_wave2.sql"
WALLET = "bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT"

COLORS = {
    "solidarity": "#ff8000",
    "health": "#e31c23",
    "environment": "#3d9b5c",
    "education": "#4a8fd4",
    "animal": "#e8a317",
    "culture": "#c084fc",
    "local": "#2dd4bf",
    "other": "#f4ecdf",
}

# slug, name, tagline, description, city, country, website, category
ORGS = [
    ("sidaction", "Sidaction", "Recherche, soins, VIH.", "Collecte et financement de la recherche et des associations de lutte contre le VIH/sida en France et à l’international.", "Paris", "France", "https://www.sidaction.org", "health"),
    ("aides", "AIDES", "VIH, hépatites, droits.", "Association de personnes concernées. Dépistage, réduction des risques, plaidoyer, accompagnement.", "Pantin", "France", "https://www.aides.org", "health"),
    ("sos-amitie", "SOS Amitié", "Écouter, 24 heures sur 24.", "Écoute anonyme de la souffrance psychique et de la détresse. Ligne nationale, bénévoles formés.", "Paris", "France", "https://www.sos-amitie.com", "health"),
    ("sos-villages-enfants", "SOS Villages d’Enfants", "Fratries, un toit, un avenir.", "Accueil de frères et sœurs séparés de leurs parents. Villages, accompagnement, insertion.", "Paris", "France", "https://www.sosve.org", "education"),
    ("apprentis-auteuil", "Apprentis d’Auteuil", "Jeunes en difficulté, une chance.", "Accueil, éducation, formation professionnelle de jeunes et de familles fragilisés.", "Paris", "France", "https://www.apprentis-auteuil.org", "education"),
    ("armee-du-salut", "Armée du Salut", "Soupe, toit, dignité.", "Hébergement, aide alimentaire, insertion. Un réseau historique de solidarité urbaine.", "Paris", "France", "https://www.armeedusalut.fr", "solidarity"),
    ("secours-islamique", "Secours Islamique France", "Urgence, orphelins, eau.", "ONG humanitaire française. Urgences, développement, collecte du ramadan et du sacrifice.", "Paris", "France", "https://www.secours-islamique.org", "solidarity"),
    ("ccfd-terre-solidaire", "CCFD-Terre Solidaire", "Souveraineté alimentaire.", "Première ONG de développement en France. Partenaires locaux, plaidoyer, éducation à la solidarité.", "Paris", "France", "https://ccfd-terresolidaire.org", "solidarity"),
    ("solidarites-international", "Solidarités International", "Eau, hygiène, survie.", "ONG française d’urgence. Accès à l’eau, assainissement, aide alimentaire dans les crises.", "Clichy", "France", "https://www.solidarites.org", "solidarity"),
    ("premiere-urgence", "Première Urgence Internationale", "Santé, nutrition, relèvement.", "Missions médico-nutritionnelles et d’urgence dans les zones de conflit et de catastrophe.", "Asnières-sur-Seine", "France", "https://www.premiere-urgence.org", "health"),
    ("acted", "ACTED", "Accès, crises, relèvement.", "ONG française de solidarité internationale. Urgence, reconstruction, développement.", "Paris", "France", "https://www.acted.org", "solidarity"),
    ("alima", "ALIMA", "Soigner autrement, en Afrique.", "Alliance médicale. Recherche opérationnelle et soins d’urgence, avec des partenaires africains.", "Dakar", "Sénégal", "https://alima.ngo", "health"),
    ("france-nature-environnement", "France Nature Environnement", "Le vivant a des porte-voix.", "Fédération française des associations de protection de la nature et de l’environnement.", "Paris", "France", "https://fne.asso.fr", "environment"),
    ("lpo", "LPO", "Oiseaux, nature, éducation.", "Ligue pour la Protection des Oiseaux. Refuges, sciences participatives, plaidoyer.", "Rochefort", "France", "https://www.lpo.fr", "environment"),
    ("fondation-nature-homme", "Fondation pour la Nature et l’Homme", "Écologie, un projet de société.", "Fondation de Nicolas Hulot. Climat, biodiversité, justice sociale.", "Paris", "France", "https://www.fnh.org", "environment"),
    ("surfrider-europe", "Surfrider Foundation Europe", "Océan, plages, plastique.", "Défense du littoral et de l’océan. Initiatives océanes, plaidoyer européen.", "Biarritz", "France", "https://www.surfrider.eu", "environment"),
    ("sea-shepherd-france", "Sea Shepherd France", "Gardiens des océans.", "Campagnes en mer contre la pêche illégale et la destruction des habitats marins.", "Paris", "France", "https://www.seashepherd.fr", "environment"),
    ("greenpeace-france", "Greenpeace France", "Témoins, pas spectateurs.", "Campagnes climat, nucléaire, forêts, océans. Action non-violente, indépendance.", "Paris", "France", "https://www.greenpeace.fr", "environment"),
    ("petits-princes", "Association Petits Princes", "Rêves d’enfants malades.", "Réalisation des rêves d’enfants et d’adolescents gravement malades.", "Paris", "France", "https://www.petitsprinces.com", "health"),
    ("rire-medecin", "Le Rire Médecin", "Clowns à l’hôpital.", "Artistes intervenants dans les services pédiatriques. Humour comme soin de support.", "Paris", "France", "https://www.leriremedecin.org", "health"),
    ("institut-curie", "Institut Curie", "Cancer, recherche, soins.", "Fondation reconnue d’utilité publique. Soins, recherche, enseignement contre le cancer.", "Paris", "France", "https://institut-curie.org", "health"),
    ("fondation-arc", "Fondation ARC", "La recherche, un levier.", "Financement de la recherche sur le cancer. Projets, jeunes chercheurs, information.", "Villejuif", "France", "https://www.fondation-arc.org", "health"),
    ("institut-pasteur", "Institut Pasteur", "Microbes, vaccins, santé.", "Recherche biomédicale, santé publique, enseignement. Fondation créée par Louis Pasteur.", "Paris", "France", "https://www.pasteur.fr", "health"),
    ("vaincre-mucoviscidose", "Vaincre la Mucoviscidose", "Respirer, un combat.", "Patients, familles, recherche. Soins, transplantations, vie quotidienne.", "Paris", "France", "https://www.vaincrelamuco.org", "health"),
    ("ela", "ELA", "Leucodystrophies, un marathon.", "Association européenne contre les leucodystrophies. Recherche, familles, Téléthon ELA.", "Laxou", "France", "https://ela-asso.com", "health"),
    ("france-alzheimer", "France Alzheimer", "Maladie, aidants, dignité.", "Accompagnement des personnes malades et des familles. Formations, plaidoyer, recherche.", "Paris", "France", "https://www.francealzheimer.org", "health"),
    ("france-parkinson", "France Parkinson", "Recherche et quotidien.", "Patients et proches. Information, groupes, financement de la recherche.", "Paris", "France", "https://www.franceparkinson.fr", "health"),
    ("unapei", "Unapei", "Déficience intellectuelle, droits.", "Mouvement associatif. Établissements, plaidoyer, inclusion des personnes handicapées.", "Paris", "France", "https://www.unapei.org", "health"),
    ("apf-france-handicap", "APF France handicap", "Moteur, pas immobile.", "Association de personnes en situation de handicap. Droits, établissements, accessibilité.", "Paris", "France", "https://www.apf-francehandicap.org", "health"),
    ("ordre-de-malte", "Ordre de Malte France", "Secours, pèlerinage, santé.", "Urgences, care, missions internationales. Une tradition hospitalière devenue ONG.", "Paris", "France", "https://www.ordredemaltefrance.org", "solidarity"),
    ("samu-social-paris", "Samu Social de Paris", "La rue n’est pas une fatalité.", "Maraudes, hébergement d’urgence, soins. L’aide aux personnes sans abri à Paris.", "Paris", "France", "https://www.samusocial.paris", "solidarity"),
    ("aurore", "Association Aurore", "Héberger, soigner, insérer.", "Précarité, addictions, asile. Un opérateur historique de l’action sociale francilienne.", "Paris", "France", "https://www.aurore.asso.fr", "solidarity"),
    ("habitat-humanisme", "Habitat et Humanisme", "Loger pour relier.", "Logement accompagné, pensions de famille, bénévolat. Produire du lien, pas seulement des toits.", "Lyon", "France", "https://www.habitat-humanisme.org", "solidarity"),
    ("snl", "Solidarités Nouvelles pour le Logement", "Un toit, un quartier.", "Production de logements très sociaux et accompagnement des locataires.", "Paris", "France", "https://www.snl-inter.org", "solidarity"),
    ("fondation-des-femmes", "Fondation des Femmes", "Droits, abris, justice.", "Financement des associations féministes. Urgences, plaidoyer, centres d’hébergement.", "Paris", "France", "https://fondationdesfemmes.org", "solidarity"),
    ("planning-familial", "Planning Familial", "Corps, droits, santé.", "Éducation à la sexualité, contraception, IVG, lutte contre les violences.", "Paris", "France", "https://www.planning-familial.org", "health"),
    ("enfance-et-partage", "Enfance et Partage", "Enfants maltraités, une voix.", "Protection de l’enfance. Signalements, accompagnement judiciaire, prévention.", "Paris", "France", "https://enfance-et-partage.org", "education"),
    ("voix-de-lenfant", "La Voix de l’Enfant", "Parole, justice, soin.", "Collectif d’associations. Unités d’accueil pédiatrique, plaidoyer, maltraitance.", "Paris", "France", "https://www.lavoixdelenfant.org", "education"),
    ("bibliotheques-sans-frontieres", "Bibliothèques Sans Frontières", "Un livre, un cubit, un droit.", "Accès au savoir en crise et en banlieue. Ideas Box, Khan Academy, formation.", "Montreuil", "France", "https://www.bibliosansfrontieres.org", "education"),
    ("sport-dans-la-ville", "Sport dans la Ville", "Terrain, job, confiance.", "Insertion par le sport dans les quartiers. Mentorat, emploi, entrepreneuriat.", "Lyon", "France", "https://www.sportdanslaville.com", "education"),
    ("fondation-du-patrimoine", "Fondation du Patrimoine", "Sauver ce qui tient encore.", "Sauvegarde du patrimoine de proximité. Label, mécénat populaire, chantiers.", "Paris", "France", "https://www.fondation-patrimoine.org", "culture"),
    ("30-millions-damis", "Fondation 30 Millions d’Amis", "Animaux, loi, refuges.", "Protection animale. Refuges, plaidoyer, campagnes contre les abandons.", "Paris", "France", "https://www.30millionsdamis.fr", "animal"),
    ("welfarm", "Welfarm", "Élevage, un autre regard.", "Protection des animaux d’élevage. Enquêtes, plaidoyer européen, alternatives.", "Goderville", "France", "https://welfarm.fr", "animal"),
    ("l214", "L214", "Ce qu’on ne voit pas.", "Enquêtes en élevages et abattoirs. Plaidoyer, information, transition alimentaire.", "Lyon", "France", "https://www.l214.com", "animal"),
    ("fondation-brigitte-bardot", "Fondation Brigitte Bardot", "Animaux, partout.", "Refuges, campagnes, sanctuaires. Protection animale en France et à l’étranger.", "Paris", "France", "https://www.fondationbrigittebardot.fr", "animal"),
    ("aspas", "ASPAS", "Faune sauvage, sans chasse.", "Association pour la protection des animaux sauvages. Réserves, contentieux, éducation.", "Sisteron", "France", "https://www.aspas-nature.org", "environment"),
    ("utopia-56", "Utopia 56", "Migrants, un accueil concret.", "Collectif de soutien aux personnes exilées. Maraudes, mises à l’abri, témoignage.", "Paris", "France", "https://utopia56.org", "solidarity"),
    ("la-cimade", "La Cimade", "Étrangers, droits, hospitalité.", "Accompagnement juridique des personnes étrangères. Rétention, asile, plaidoyer.", "Paris", "France", "https://www.lacimade.org", "solidarity"),
    ("france-terre-dasile", "France terre d’asile", "Asile, un droit vivant.", "Accueil et accompagnement des demandeurs d’asile et des réfugiés.", "Paris", "France", "https://www.france-terre-asile.org", "solidarity"),
    ("forum-refugies", "Forum réfugiés", "Protéger, héberger, intégrer.", "Asile et intégration. Centres d’accueil, juridique, plaidoyer à Lyon et ailleurs.", "Lyon", "France", "https://www.forumrefugies.org", "solidarity"),
    ("atd-quart-monde", "ATD Quart Monde", "La misère n’est pas une faute.", "Mouvement de personnes en grande pauvreté. Croisement des savoirs, plaidoyer, fraternité.", "Pierrelaye", "France", "https://www.atd-quartmonde.fr", "solidarity"),
    ("banques-alimentaires", "Banques Alimentaires", "Collecter pour nourrir.", "Réseau de collecte et de redistribution alimentaire vers les associations.", "Paris", "France", "https://www.banquealimentaire.org", "solidarity"),
    ("snsm", "SNSM", "En mer, des bénévoles.", "Société Nationale de Sauvetage en Mer. Canots, plages, formation. 80 % de bénévoles.", "Paris", "France", "https://www.snsm.org", "solidarity"),
    ("protection-civile", "Protection Civile", "Secourir, former, prévenir.", "Fédération nationale. Postes de secours, urgences, formation aux gestes qui sauvent.", "Asnières-sur-Seine", "France", "https://protection-civile.org", "health"),
    ("electriciens-sans-frontieres", "Électriciens sans frontières", "Le courant, un droit.", "Accès à l’électricité et à l’eau. Urgences, développement, bénévoles du métier.", "Villeurbanne", "France", "https://electriciens-sans-frontieres.org", "solidarity"),
    ("avsf", "AVSF", "Paysans, vétérinaires, terre.", "Agronomes et Vétérinaires Sans Frontières. Agriculture familiale, santé animale.", "Lyon", "France", "https://www.avsf.org", "environment"),
    ("reporters-sans-frontieres", "Reporters sans frontières", "Informer n’est pas un crime.", "Liberté de la presse. Classements, protection des journalistes, plaidoyer.", "Paris", "France", "https://rsf.org", "solidarity"),
    ("ldh", "Ligue des droits de l’Homme", "1902, et toujours.", "Droits civils, sociaux, étrangers. Un mouvement historique de vigilance démocratique.", "Paris", "France", "https://www.ldh-france.org", "solidarity"),
    ("licra", "LICRA", "Racisme, antisémitisme, loi.", "Ligue internationale contre le racisme et l’antisémitisme. Contentieux, éducation.", "Paris", "France", "https://www.licra.org", "solidarity"),
    ("sos-racisme", "SOS Racisme", "Touche pas à mon pote.", "Lutte contre le racisme. Testing, éducation, vie associative.", "Paris", "France", "https://sos-racisme.org", "solidarity"),
    ("action-enfance", "Action Enfance", "Villages d’enfants.", "Accueil d’enfants en danger. Villages, scolarité, fratries réunies.", "Paris", "France", "https://www.actionenfance.org", "education"),
    ("goodplanet", "Fondation GoodPlanet", "Écologie, pédagogique.", "Fondation de Yann Arthus-Bertrand. Exposition, programmes, climat.", "Paris", "France", "https://www.goodplanet.org", "environment"),
    ("article-1", "Article 1", "Mérite, pas codes postaux.", "Égalité des chances dans l’enseignement supérieur. Mentorat, bourses, réseau.", "Paris", "France", "https://article-1.eu", "education"),
    ("force-femmes", "Force Femmes", "45 ans, un emploi.", "Accompagnement des femmes de 45 ans et plus vers l’emploi et l’entrepreneuriat.", "Paris", "France", "https://www.forcefemmes.com", "solidarity"),
    ("autisme-france", "Autisme France", "Diagnostic, école, vie.", "Représentation des personnes autistes et des familles. Droits, formations, plaidoyer.", "Paris", "France", "https://www.autismefrance.org", "health"),
    ("unafam", "Unafam", "Aidants en santé mentale.", "Union nationale de familles et amis de personnes malades psychiques. Écoute, groupes.", "Paris", "France", "https://www.unafam.org", "health"),
    ("pieces-jaunes", "Pièces Jaunes", "Hôpitaux, enfance, réconfort.", "Fondation Hôpitaux de Paris-Hôpitaux de France. Humanisation des soins pédiatriques.", "Paris", "France", "https://www.fondationhopitaux.fr", "health"),
    ("federation-aveugles", "Fédération des Aveugles", "Voir autrement.", "Déficience visuelle. Services, emploi, accessibilité, plaidoyer.", "Paris", "France", "https://www.aveuglesdefrance.org", "health"),
    ("raoul-follereau", "Fondation Raoul Follereau", "Lèpre, et après.", "Lutte contre la lèpre et la précarité. Santé, éducation, insertion.", "Paris", "France", "https://www.raoul-follereau.org", "solidarity"),
    ("clowns-sans-frontieres", "Clowns Sans Frontières", "Rire là où ça manque.", "Spectacles dans les camps, les prisons, les rues. Artistes en mission.", "Paris", "France", "https://www.clowns-sans-frontieres.org", "culture"),
    ("aviation-sans-frontieres", "Aviation Sans Frontières", "Un avion, un colis, un enfant.", "Transport humanitaire, accompagnement d’enfants malades, logistique d’urgence.", "Paris", "France", "https://asf-fr.org", "solidarity"),
    ("architectes-de-lurgence", "Architectes de l’urgence", "Reconstruire vite, bien.", "Diagnostic et reconstruction après catastrophes. Logements, écoles, hôpitaux.", "Paris", "France", "https://www.archi-urgent.com", "solidarity"),
    ("telecoms-sans-frontieres", "Télécoms Sans Frontières", "Un réseau, une voix.", "Télécommunications d’urgence. Appels familiaux, data pour les ONG.", "Pau", "France", "https://www.tsfi.org", "solidarity"),
    ("unis-cite", "Unis-Cité", "Service civique, quartier.", "Pionnier du service civique en France. Jeunes en mission dans les associations.", "Paris", "France", "https://www.uniscite.fr", "education"),
    ("petits-debrouillards", "Les Petits Débrouillards", "Science, mains nues.", "Éducation scientifique populaire. Ateliers, égalité, esprit critique.", "Paris", "France", "https://www.lespetitsdebrouillards.org", "education"),
    ("nightline-france", "Nightline France", "Étudiants, une oreille.", "Écoute par les pairs pour la santé mentale des étudiants, la nuit.", "Paris", "France", "https://www.nightline.fr", "health"),
    ("fondation-de-lavenir", "Fondation de l’Avenir", "Recherche appliquée.", "Financement de la recherche médicale appliquée, aux côtés des mutuelles.", "Paris", "France", "https://www.fondationdelavenir.org", "health"),
    ("institut-imagine", "Institut Imagine", "Maladies génétiques.", "Institut des maladies génétiques. Soins, recherche, familles, à Necker.", "Paris", "France", "https://www.institutimagine.org", "health"),
    ("bloom", "BLOOM", "Pêche, océan, vérité.", "ONG océanique. Chalutage profond, surpêche, plaidoyer européen.", "Paris", "France", "https://bloomassociation.org", "environment"),
    ("robin-des-bois", "Robin des Bois", "Déchets, navires, faune.", "Association d’expertise. Amiante, naufrages, espèces, information publique.", "Paris", "France", "https://www.robindesbois.org", "environment"),
    ("entourage", "Entourage", "SDF, un réseau de voisins.", "Application et communauté pour relier riverains et personnes à la rue.", "Paris", "France", "https://www.entourage.social", "solidarity"),
    ("chaine-de-espoir", "La Chaîne de l’Espoir", "Enfants, chirurgiens, vie.", "Chirurgie cardiaque et reconstructrice pour les enfants des pays en crise.", "Paris", "France", "https://www.chainedelespoir.org", "health"),
    ("enfants-du-mekong", "Enfants du Mékong", "Scolarité, Asie du Sud-Est.", "Parrainages, internats, formation. Cambodge, Vietnam, Laos, Philippines, Birmanie.", "Puteaux", "France", "https://www.enfantsdumekong.com", "education"),
    ("partage", "Partage", "Parrainer un enfant.", "Parrainages et programmes communautaires en Afrique, Asie, Amérique latine.", "Paris", "France", "https://www.partage.org", "education"),
    ("un-enfant-par-la-main", "Un Enfant par la Main", "Fille, école, village.", "Membre de ChildFund. Parrainage, développement communautaire.", "Paris", "France", "https://www.unenfantparlamain.org", "education"),
    ("vision-du-monde", "Vision du Monde", "World Vision, en France.", "Parrainages, urgences, plaidoyer. Comité français de World Vision.", "Cergy", "France", "https://www.visiondumonde.fr", "education"),
    ("amref-france", "Amref France", "Santé africaine, par l’Afrique.", "Comité français d’Amref Health Africa. Formation des agents de santé, femmes, communautés.", "Paris", "France", "https://amref.fr", "health"),
    ("gret", "GRET", "Professionnels du développement.", "ONG de professionnels. Eau, agriculture, microfinance, politiques publiques.", "Nogent-sur-Marne", "France", "https://gret.org", "solidarity"),
    ("geres", "GERES", "Énergie, climat, sud.", "Efficacité énergétique et énergies renouvelables dans les pays en développement.", "Aubagne", "France", "https://www.geres.eu", "environment"),
    ("max-havelaar-france", "Max Havelaar France", "Commerce, un prix juste.", "Label Fairtrade en France. Cacao, café, banane — des filières plus justes.", "Paris", "France", "https://maxhavelaarfrance.org", "solidarity"),
    ("valentin-hauy", "Association Valentin Haüy", "Cécité, autonomie.", "Depuis 1889. Livres adaptés, chiens guides, emploi, sport.", "Paris", "France", "https://www.avh.asso.fr", "health"),
    ("arsep", "Fondation ARSEP", "Sclérose en plaques.", "Recherche sur la SEP. Financement, information, patients.", "Paris", "France", "https://www.arsep.org", "health"),
    ("singa", "SINGA", "Réfugiés, entrepreneurs.", "Communautés et entrepreneuriat pour les personnes réfugiées et les locaux.", "Paris", "France", "https://singa.org", "solidarity"),
    ("jrs-france", "JRS France", "Hospitalité jésuite.", "Jesuit Refugee Service. Accompagnement des demandeurs d’asile, cours de français.", "Paris", "France", "https://www.jrsfrance.org", "solidarity"),
    ("konexio", "Konexio", "Numérique, insertion.", "Formation digitale pour réfugiés et personnes éloignées de l’emploi.", "Paris", "France", "https://www.konexio.eu", "education"),
    ("each-one", "each One", "Réfugiés, un métier.", "Formation et emploi des personnes réfugiées. Entreprises, coaching, français pro.", "Paris", "France", "https://eachone.org", "education"),
    ("toutes-a-lecole", "Toutes à l’école", "Filles, Cambodge, internat.", "Scolarité de filles cambodgiennes jusqu’au bac. Internat, santé, familles.", "Paris", "France", "https://www.toutesalecole.org", "education"),
    ("ecole-a-lhopital", "L’École à l’Hôpital", "Cours au chevet.", "Enseignants bénévoles auprès des enfants et ados hospitalisés en Île-de-France.", "Paris", "France", "https://www.ecolealhopital.asso.fr", "education"),
    ("ifrc", "Fédération internationale de la Croix-Rouge", "Sociétés nationales, un réseau.", "IFRC. Coordination des Croix-Rouge et Croissants-Rouges. Catastrophes, santé, migration.", "Genève", "Suisse", "https://www.ifrc.org", "solidarity"),
    ("oms", "OMS — WHO", "Santé pour tous.", "Organisation mondiale de la Santé. Normes, épidémies, couverture sanitaire universelle.", "Genève", "Suisse", "https://www.who.int", "health"),
    ("fao", "FAO", "Nourrir le monde.", "Organisation des Nations Unies pour l’alimentation et l’agriculture.", "Rome", "Italie", "https://www.fao.org", "solidarity"),
    ("unesco", "UNESCO", "Éducation, culture, science.", "Organisation des Nations Unies pour l’éducation, la science et la culture.", "Paris", "France", "https://www.unesco.org", "education"),
    ("un-women", "ONU Femmes", "Égalité, partout.", "Entité des Nations Unies pour l’égalité des sexes et l’autonomisation des femmes.", "New York", "États-Unis", "https://www.unwomen.org", "solidarity"),
    ("unfpa", "UNFPA", "Santé sexuelle, droits.", "Fonds des Nations Unies pour la population. Maternité, planning, jeunes.", "New York", "États-Unis", "https://www.unfpa.org", "health"),
    ("iom", "OIM — IOM", "Migration, dignité.", "Organisation internationale pour les migrations. Protection, retours, crises.", "Genève", "Suisse", "https://www.iom.int", "solidarity"),
    ("nrc", "Norwegian Refugee Council", "Réfugiés, école, abri.", "ONG norvégienne. Éducation en urgence, abri, juridique, dans les crises oubliées.", "Oslo", "Norvège", "https://www.nrc.no", "solidarity"),
    ("drc-aid", "Danish Refugee Council", "Déplacement, un métier.", "ONG danoise. Protection, moyens de subsistance, déminage, urgences.", "Copenhague", "Danemark", "https://www.drc.ngo", "solidarity"),
    ("mercy-corps", "Mercy Corps", "Crises, marchés, relance.", "ONG américaine. Urgence et relèvement économique, jeunesse, climat.", "Portland", "États-Unis", "https://www.mercycorps.org", "solidarity"),
    ("world-vision", "World Vision", "Enfants, villages, urgences.", "Organisation chrétienne mondiale. Parrainages, catastrophes, plaidoyer.", "Londres", "Royaume-Uni", "https://www.worldvision.org", "education"),
    ("catholic-relief-services", "Catholic Relief Services", "Foi, secours, justice.", "Bras humanitaire de l’Église catholique aux États-Unis. Urgences et développement.", "Baltimore", "États-Unis", "https://www.crs.org", "solidarity"),
    ("brac", "BRAC", "Sortir de la pauvreté, à l’échelle.", "Plus grande ONG du Sud. Microfinance, écoles, santé, Bangladesh et au-delà.", "Dacca", "Bangladesh", "https://www.brac.net", "solidarity"),
    ("partners-in-health", "Partners In Health", "Soigner les pauvres, vraiment.", "Hôpitaux communautaires, VIH, tuberculose, santé maternelle. Fondée par Paul Farmer.", "Boston", "États-Unis", "https://www.pih.org", "health"),
    ("concern-worldwide", "Concern Worldwide", "Faim, extrême pauvreté.", "ONG irlandaise. Nutrition, urgences, résilience climatique.", "Dublin", "Irlande", "https://www.concern.net", "solidarity"),
    ("give-directly", "GiveDirectly", "Cash, sans détour.", "Transferts monétaires directs aux ménages extrêmement pauvres. Preuves, transparence.", "New York", "États-Unis", "https://www.givedirectly.org", "solidarity"),
    ("against-malaria", "Against Malaria Foundation", "Moustiquaires, un geste mesurable.", "Distribution de moustiquaires imprégnées. Une des charities les plus évaluées au monde.", "Kansas City", "États-Unis", "https://www.againstmalaria.com", "health"),
    ("helen-keller-intl", "Helen Keller Intl", "Vue, nutrition, femmes.", "Cécité évitable, malnutrition, santé maternelle. Un héritage d’Helen Keller.", "New York", "États-Unis", "https://www.hki.org", "health"),
    ("sightsavers", "Sightsavers", "Trachome, lunettes, école.", "Lutte contre la cécité évitable et l’inclusion des personnes handicapées.", "Haywards Heath", "Royaume-Uni", "https://www.sightsavers.org", "health"),
    ("wateraid", "WaterAid", "Eau, toilettes, hygiène.", "ONG britannique. Accès durable à l’eau et à l’assainissement.", "Londres", "Royaume-Uni", "https://www.wateraid.org", "solidarity"),
    ("charity-water", "charity: water", "100 % aux projets.", "Forages, cartographie, transparence. Les frais de structure sont financés à part.", "New York", "États-Unis", "https://www.charitywater.org", "solidarity"),
    ("water-org", "Water.org", "Crédit eau, pas que des puits.", "WaterCredit : microcrédits pour l’eau et l’assainissement, cofondé par Matt Damon.", "Kansas City", "États-Unis", "https://water.org", "solidarity"),
    ("one-acre-fund", "One Acre Fund", "Semences, crédit, récolte.", "Services agricoles aux petits exploitants d’Afrique de l’Est.", "Kakamega", "Kenya", "https://oneacrefund.org", "solidarity"),
    ("heifer", "Heifer International", "Un animal, une filière.", "Bétail, formation, passage de don. Développement rural depuis 1944.", "Little Rock", "États-Unis", "https://www.heifer.org", "solidarity"),
    ("room-to-read", "Room to Read", "Filles, livres, écoles.", "Alphabétisation et scolarité des filles en Asie et en Afrique.", "San Francisco", "États-Unis", "https://www.roomtoread.org", "education"),
    ("camfed", "CAMFED", "Filles, Afrique, avenir.", "Scolarité des jeunes filles en Afrique subsaharienne. Alumni devenues mentors.", "Cambridge", "Royaume-Uni", "https://camfed.org", "education"),
    ("human-rights-watch", "Human Rights Watch", "Enquêter, publier, tenir.", "Rapports, crises, plaidoyer. Droits humains, sans affiliation étatique.", "New York", "États-Unis", "https://www.hrw.org", "solidarity"),
    ("fidh", "FIDH", "Ligues, un réseau mondial.", "Fédération internationale pour les droits humains. 180 organisations, contentieux.", "Paris", "France", "https://www.fidh.org", "solidarity"),
    ("transparency-international", "Transparency International", "Corruption, un indice.", "Coalition mondiale contre la corruption. Indice, plaidoyer, protection des lanceurs d’alerte.", "Berlin", "Allemagne", "https://www.transparency.org", "solidarity"),
    ("survival-international", "Survival International", "Peuples autochtones.", "Droits des peuples indigènes. Terres, consentement, contre les expulsions.", "Londres", "Royaume-Uni", "https://www.survivalinternational.org", "solidarity"),
    ("rainforest-alliance", "Rainforest Alliance", "Forêts, fermes, label.", "Certification, communautés, climat. Café, cacao, banane — des filières moins destructrices.", "New York", "États-Unis", "https://www.rainforest-alliance.org", "environment"),
    ("conservation-international", "Conservation International", "Nature, climat, peuples.", "Aires protégées, science, partenariats. Carbone, océans, forêts.", "Arlington", "États-Unis", "https://www.conservation.org", "environment"),
    ("wildlife-conservation-society", "Wildlife Conservation Society", "Zoo, terrain, espèces.", "Bronx Zoo et 50 pays. Science de la conservation, braconnage, aires protégées.", "New York", "États-Unis", "https://www.wcs.org", "environment"),
    ("iucn", "UICN — IUCN", "Liste rouge, une boussole.", "Union internationale pour la conservation de la nature. Statuts d’espèces, politiques.", "Gland", "Suisse", "https://www.iucn.org", "environment"),
    ("oceana", "Oceana", "Pêche, loi, océan.", "Campagnes juridiques pour reconstruire les océans. Quotas, aires, plastique.", "Washington", "États-Unis", "https://oceana.org", "environment"),
    ("friends-of-the-earth", "Friends of the Earth", "Écologie, justice.", "Réseau mondial. Climat, extractivisme, droits des communautés.", "Amsterdam", "Pays-Bas", "https://www.foei.org", "environment"),
    ("rspb", "RSPB", "Oiseaux, îles, marais.", "Royal Society for the Protection of Birds. Réserves, science, éducation.", "Sandy", "Royaume-Uni", "https://www.rspb.org.uk", "environment"),
    ("rspca", "RSPCA", "Animaux, 1824.", "Plus ancienne protection animale au monde. Inspecteurs, refuges, plaidoyer.", "Horsham", "Royaume-Uni", "https://www.rspca.org.uk", "animal"),
    ("aspca", "ASPCA", "États-Unis, une voix animale.", "American Society for the Prevention of Cruelty to Animals. Refuges, lois, urgences.", "New York", "États-Unis", "https://www.aspca.org", "animal"),
    ("ifaw", "IFAW", "Faune, secours, politiques.", "International Fund for Animal Welfare. Désastres, braconnage, cétacés.", "Washington", "États-Unis", "https://www.ifaw.org", "animal"),
    ("jane-goodall-institute", "Jane Goodall Institute", "Chimpanzés, racines, espoir.", "Conservation communautaire. Roots & Shoots, sanctuaires, recherche.", "Washington", "États-Unis", "https://janegoodall.org", "environment"),
    ("african-wildlife-foundation", "African Wildlife Foundation", "Afrique, par l’Afrique.", "Éléphants, lions, communautés. Conservation et développement rural.", "Nairobi", "Kenya", "https://www.awf.org", "environment"),
    ("birdlife", "BirdLife International", "Oiseaux, un réseau mondial.", "Partenariat de 100 organisations nationales. Espèces, sites, politiques.", "Cambridge", "Royaume-Uni", "https://www.birdlife.org", "environment"),
    ("fauna-flora", "Fauna & Flora", "Espèces, depuis 1903.", "Conservation sur le terrain. Forêts, mers, communautés — ancienne Fauna & Flora International.", "Cambridge", "Royaume-Uni", "https://www.fauna-flora.org", "environment"),
    ("ocean-cleanup", "The Ocean Cleanup", "Plastique, rivières, gyres.", "Technologies pour extraire le plastique des océans et des fleuves.", "Rotterdam", "Pays-Bas", "https://theoceancleanup.com", "environment"),
    ("gavi", "Gavi", "Vaccins, un milliard d’enfants.", "Alliance du vaccin. Financement, marchés, équité vaccinale.", "Genève", "Suisse", "https://www.gavi.org", "health"),
    ("the-global-fund", "Fonds mondial", "Sida, tuberculose, paludisme.", "Partenariat public-privé. Financement des programmes nationaux contre les trois épidémies.", "Genève", "Suisse", "https://www.theglobalfund.org", "health"),
    ("path", "PATH", "Innovation, santé publique.", "ONG de Seattle. Vaccins, diagnostics, santé digitale, nutrition.", "Seattle", "États-Unis", "https://www.path.org", "health"),
    ("msi", "MSI Reproductive Choices", "Choix, cliniques, droits.", "Cliniques et plaidoyer pour la santé sexuelle et reproductive.", "Londres", "Royaume-Uni", "https://www.msichoices.org", "health"),
    ("ippf", "IPPF", "Planning, un réseau.", "Fédération internationale pour la planification familiale. Cliniques, jeunes, plaidoyer.", "Londres", "Royaume-Uni", "https://www.ippf.org", "health"),
    ("caritas-internationalis", "Caritas Internationalis", "Église, pauvres, crises.", "Confédération de 160 Caritas nationales. Urgence, développement, plaidoyer.", "Rome", "Italie", "https://www.caritas.org", "solidarity"),
    ("actionaid", "ActionAid", "Femmes, terre, justice.", "Fédération internationale. Droits des femmes, éducation, urgences.", "Johannesburg", "Afrique du Sud", "https://actionaid.org", "solidarity"),
    ("trocaire", "Trócaire", "Irlande, un pont.", "Agence catholique irlandaise. Urgences, climat, femmes.", "Maynooth", "Irlande", "https://www.trocaire.org", "solidarity"),
    ("british-red-cross", "British Red Cross", "Croix-Rouge britannique.", "Urgences nationales et internationales. Réfugiés, premiers secours, catastrophes.", "Londres", "Royaume-Uni", "https://www.redcross.org.uk", "solidarity"),
    ("american-red-cross", "American Red Cross", "Sang, tempêtes, familles.", "Collecte de sang, secours aux sinistrés, messages aux militaires, formation.", "Washington", "États-Unis", "https://www.redcross.org", "health"),
    ("canadian-red-cross", "Croix-Rouge canadienne", "Nord, urgences, formation.", "Secours aux sinistrés, premiers soins, opérations internationales.", "Ottawa", "Canada", "https://www.redcross.ca", "solidarity"),
    ("german-red-cross", "Deutsches Rotes Kreuz", "Croix-Rouge allemande.", "Secours, santé, social, international. L’une des plus grandes sociétés nationales.", "Berlin", "Allemagne", "https://www.drk.de", "solidarity"),
    ("qatar-charity", "Qatar Charity", "Golfe, urgences, orphelins.", "ONG qatarienne. Aide alimentaire, eau, éducation, catastrophes.", "Doha", "Qatar", "https://www.qcharity.org", "solidarity"),
    ("muslim-aid", "Muslim Aid", "Foi, développement, urgence.", "ONG britannique. Ramadan, qurbani, éducation, eau.", "Londres", "Royaume-Uni", "https://www.muslimaid.org", "solidarity"),
    ("operation-smile", "Operation Smile", "Fentes, une chirurgie.", "Chirurgie réparatrice des fentes labio-palatines, formation des équipes locales.", "Virginia Beach", "États-Unis", "https://www.operationsmile.org", "health"),
    ("smile-train", "Smile Train", "Chirurgie locale, à vie.", "Financement et formation des chirurgiens locaux pour les fentes, dans le pays du patient.", "New York", "États-Unis", "https://www.smiletrain.org", "health"),
    ("st-jude", "St. Jude Children’s Research Hospital", "Cancers d’enfants, sans facture.", "Hôpital de recherche. Les familles ne paient pas. Protocoles partagés dans le monde.", "Memphis", "États-Unis", "https://www.stjude.org", "health"),
    ("make-a-wish", "Make-A-Wish", "Un vœu, une force.", "Réalisation des vœux d’enfants atteints de maladies critiques. Réseau mondial.", "Phoenix", "États-Unis", "https://wish.org", "health"),
    ("special-olympics", "Special Olympics", "Sport, handicap intellectuel.", "Compétitions et santé pour les personnes en situation de handicap intellectuel.", "Washington", "États-Unis", "https://www.specialolympics.org", "health"),
    ("right-to-play", "Right To Play", "Jouer pour apprendre.", "Sport et jeu pour l’éducation et la protection des enfants dans les crises.", "Toronto", "Canada", "https://righttoplay.com", "education"),
    ("wikimedia-foundation", "Wikimedia Foundation", "Le savoir, un bien commun.", "Wikipédia et les projets libres. Serveurs, bénévoles, accès à l’information.", "San Francisco", "États-Unis", "https://wikimediafoundation.org", "education"),
    ("khan-academy", "Khan Academy", "Cours, gratuits, partout.", "Leçons et exercices en ligne. Maths, sciences, gratuit pour le monde entier.", "Mountain View", "États-Unis", "https://www.khanacademy.org", "education"),
    ("pratham", "Pratham", "Lire, compter, Inde.", "Plus grande ONG éducative d’Inde. Enseignement de rattrapage, évaluations ASER.", "Mumbai", "Inde", "https://www.pratham.org", "education"),
    ("akshaya-patra", "Akshaya Patra", "Un repas, une école.", "Cantines scolaires en Inde. Des millions de repas, chaque jour d’école.", "Bengaluru", "Inde", "https://www.akshayapatra.org", "education"),
    ("cbm", "CBM", "Handicap, un siècle.", "Christoffel-Blindenmission. Prévention de la cécité, inclusion, urgences.", "Bensheim", "Allemagne", "https://www.cbm.org", "health"),
    ("light-for-the-world", "Light for the World", "Vue, inclusion, Afrique.", "ONG autrichienne. Santé oculaire, éducation inclusive, plaidoyer.", "Vienne", "Autriche", "https://www.light-for-the-world.org", "health"),
    ("kiva", "Kiva", "Prêts, 25 dollars.", "Microcrédits participatifs. Petits entrepreneurs, étudiants, agriculteurs.", "San Francisco", "États-Unis", "https://www.kiva.org", "solidarity"),
    ("visionfund", "VisionFund", "Microfinance, World Vision.", "Institution de microfinance. Crédit rural, femmes, résilience.", "Londres", "Royaume-Uni", "https://www.visionfund.org", "solidarity"),
    ("fred-hollows", "The Fred Hollows Foundation", "Cataracte, un geste.", "Chirurgie de la cataracte et formation en Océanie, Asie, Afrique.", "Sydney", "Australie", "https://www.hollows.org", "health"),
    ("orbis", "Orbis", "Un avion-hôpital.", "Flying Eye Hospital. Formation des ophtalmologistes, soins oculaires.", "New York", "États-Unis", "https://www.orbis.org", "health"),
    ("one-tree-planted", "One Tree Planted", "Un dollar, un arbre.", "Reforestation. Projets communautaires, transparence par zone.", "Shelburne", "États-Unis", "https://onetreeplanted.org", "environment"),
    ("plant-for-the-planet", "Plant-for-the-Planet", "Enfants, trillion d’arbres.", "Mouvement jeunesse. Plantations, académies, restauration d’écosystèmes.", "Tutzing", "Allemagne", "https://www.plant-for-the-planet.org", "environment"),
    ("rainforest-trust", "Rainforest Trust", "Acheter pour protéger.", "Achat et création d’aires protégées tropicales avec des partenaires locaux.", "Warrenton", "États-Unis", "https://www.rainforesttrust.org", "environment"),
    ("world-land-trust", "World Land Trust", "Terres, un acte notarié.", "Achat de terres critiques pour la biodiversité, avec des ONG du Sud.", "Halesworth", "Royaume-Uni", "https://www.worldlandtrust.org", "environment"),
    ("national-trust", "National Trust", "Maisons, côtes, sentiers.", "Patrimoine et nature au Royaume-Uni. Membres, bénévoles, accès public.", "Swindon", "Royaume-Uni", "https://www.nationaltrust.org.uk", "culture"),
    ("internet-archive", "Internet Archive", "Mémoire du web.", "Bibliothèque numérique. Wayback Machine, livres, audio — un bien commun.", "San Francisco", "États-Unis", "https://archive.org", "education"),
    ("code-org", "Code.org", "Coder à l’école.", "Cours d’informatique gratuits. Hour of Code, formation des enseignants.", "Seattle", "États-Unis", "https://code.org", "education"),
    ("teach-for-all", "Teach For All", "Profs, inégalités, réseau.", "Réseau mondial d’organisations. Enseignants dans les écoles défavorisées.", "New York", "États-Unis", "https://teachforall.org", "education"),
    ("project-hope", "Project HOPE", "Santé, navires, formation.", "Soignants et fournitures. Urgences, santé des femmes, formation.", "Washington", "États-Unis", "https://www.projecthope.org", "health"),
    ("map-international", "MAP International", "Médicaments, last mile.", "Distribution de médicaments essentiels aux cliniques du Sud.", "Brunswick", "États-Unis", "https://www.map.org", "health"),
    ("water-for-people", "Water For People", "Forever, pas un forage.", "Eau et assainissement durables, districts entiers, jusqu’à Everyone Forever.", "Denver", "États-Unis", "https://www.waterforpeople.org", "solidarity"),
    ("trees-for-the-future", "Trees for the Future", "Forêts comestibles.", "Forest Garden. Agriculteurs, sécurité alimentaire, Sahel et au-delà.", "Silver Spring", "États-Unis", "https://trees.org", "environment"),
    ("born-free", "Born Free Foundation", "Animaux, liberté.", "Contre les cirques, les fermes à tigres, le commerce. Sanctuaires, plaidoyer.", "Horsham", "Royaume-Uni", "https://www.bornfree.org.uk", "animal"),
    ("panthera", "Panthera", "Félins, corridors.", "Conservation des félins sauvages. Jaguars, tigres, lions, léopards des neiges.", "New York", "États-Unis", "https://panthera.org", "environment"),
    ("clientearth", "ClientEarth", "Le droit, un levier vert.", "Juristes pour le climat et la nature. Procès, directives, entreprises.", "Londres", "Royaume-Uni", "https://www.clientearth.org", "environment"),
    ("global-witness", "Global Witness", "Forêts, mines, corruption.", "Enquêtes sur les liens entre ressources naturelles, conflits et droits humains.", "Londres", "Royaume-Uni", "https://www.globalwitness.org", "solidarity"),
    ("refugees-international", "Refugees International", "Plaidoyer, terrain, voix.", "Pas d’opération directe : enquêtes et plaidoyer pour les déplacés.", "Washington", "États-Unis", "https://www.refugeesinternational.org", "solidarity"),
    ("irc-uk", "IRC Royaume-Uni", "De la guerre à la relance.", "International Rescue Committee au Royaume-Uni. Réfugiés, santé, éducation.", "Londres", "Royaume-Uni", "https://www.rescue-uk.org", "solidarity"),
    ("save-the-children-france", "Save the Children France", "Enfants, ici et là-bas.", "Comité français. Protection, éducation, urgences, pauvreté infantile en France.", "Paris", "France", "https://www.savethechildren.fr", "education"),
    ("oxfam-france", "Oxfam France", "Inégalités, un dossier.", "Campagnes fiscales, urgences, commerces solidaires. Membre de la confédération Oxfam.", "Paris", "France", "https://www.oxfamfrance.org", "solidarity"),
    ("handicap-international-uk", "Humanity & Inclusion UK", "Mines, handicap, crises.", "Membre du réseau HI. Réadaptation, déminage, inclusion.", "Londres", "Royaume-Uni", "https://www.humanity-inclusion.org.uk", "health"),
    ("msf-usa", "Doctors Without Borders USA", "MSF, bureau américain.", "Collecte, témoignage, recrutement. Le mouvement MSF aux États-Unis.", "New York", "États-Unis", "https://www.doctorswithoutborders.org", "health"),
    ("unicef-uk", "UNICEF UK", "Enfance, Royaume-Uni.", "Comité britannique de l’UNICEF. Urgences, éducation, plaidoyer.", "Londres", "Royaume-Uni", "https://www.unicef.org.uk", "education"),
    ("wwf-uk", "WWF-UK", "Panda, îles, climat.", "Bureau britannique du WWF. Nature, océans, empreinte.", "Woking", "Royaume-Uni", "https://www.wwf.org.uk", "environment"),
    ("amnesty-uk", "Amnesty International UK", "Lettres, rues, lois.", "Section britannique. Prisonniers d’opinion, armes, discriminations.", "Londres", "Royaume-Uni", "https://www.amnesty.org.uk", "solidarity"),
    ("red-crescent", "IFRC Croissant-Rouge", "Croissant, le même serment.", "Mouvement international. Sociétés du Croissant-Rouge, urgences, santé.", "Genève", "Suisse", "https://www.ifrc.org", "solidarity"),
    ("islamic-relief-usa", "Islamic Relief USA", "Zakat, urgences, orphelins.", "Bureau américain d’Islamic Relief. Ramadan, eau, éducation.", "Alexandria", "États-Unis", "https://irusa.org", "solidarity"),
    ("human-appeal", "Human Appeal", "Urgence, orphelins, eau.", "ONG britannique. Crises, parrainages, ramadan.", "Manchester", "Royaume-Uni", "https://www.humanappeal.org.uk", "solidarity"),
    ("intersos", "INTERSOS", "Italie, premières lignes.", "ONG italienne d’urgence. Protection, santé, éducation dans les conflits.", "Rome", "Italie", "https://www.intersos.org", "solidarity"),
    ("cesvi", "CESVI", "Coopération, Italie.", "ONG italienne. Enfance, environnement, urgences.", "Bergame", "Italie", "https://www.cesvi.eu", "solidarity"),
    ("action-contre-la-faim-us", "Action Against Hunger USA", "Faim, un réseau.", "Membre du réseau ACF. Nutrition, eau, urgences.", "New York", "États-Unis", "https://www.actionagainsthunger.org", "solidarity"),
    ("direct-relief-eu", "Direct Relief Europe", "Médicaments, last mile.", "Antenne européenne de Direct Relief. Aide médicale aux soignants.", "Bruxelles", "Belgique", "https://www.directrelief.org", "health"),
    ("plan-france", "Plan International France", "Filles, droits, parrainage.", "Comité français de Plan. Éducation des filles, urgences, plaidoyer.", "Paris", "France", "https://www.plan-international.fr", "education"),
    ("care-usa", "CARE USA", "Colis, puis le monde.", "Siège historique de CARE. Crises, femmes, climat.", "Atlanta", "États-Unis", "https://www.care.org", "solidarity"),
    ("habitat-france", "Habitat for Humanity France", "Un toit, des bénévoles.", "Comité français. Construction, rénovation, insertion par le logement.", "Paris", "France", "https://www.habitatfrance.org", "solidarity"),
    ("wwf-belgique", "WWF-Belgique", "Nature, un petit pays.", "Bureau belge du WWF. Biodiversité, consommation, plaidoyer.", "Bruxelles", "Belgique", "https://www.wwf.be", "environment"),
    ("croix-rouge-belge", "Croix-Rouge de Belgique", "Secours, sang, social.", "Société nationale. Premiers secours, collecte, aide sociale, international.", "Bruxelles", "Belgique", "https://www.croix-rouge.be", "health"),
    ("croix-rouge-suisse", "Croix-Rouge suisse", "Alpes, asile, santé.", "Société nationale. Secours, intégration, santé, coopération.", "Berne", "Suisse", "https://www.redcross.ch", "solidarity"),
    ("medair", "Medair", "Urgence, foi, logistique.", "ONG suisse. Santé, eau, abri dans les crises oubliées.", "Ecublens", "Suisse", "https://www.medair.org", "solidarity"),
    ("helvetas", "Helvetas", "Développement suisse.", "ONG suisse. Eau, compétences, équitable, climat.", "Zurich", "Suisse", "https://www.helvetas.org", "solidarity"),
    ("terre-des-hommes", "Terre des hommes", "Enfants, Suisse, monde.", "Fondation lausannoise. Santé, protection, urgences infantiles.", "Lausanne", "Suisse", "https://www.tdh.org", "education"),
    ("tdh-france", "Terre des Hommes France", "Enfance, droits, sud.", "Membre du mouvement. Travail des enfants, migration, développement.", "Paris", "France", "https://www.terredeshommes.fr", "education"),
    ("sos-kinderdorf", "SOS Children's Villages", "Villages, un modèle mondial.", "Fratries, éducateurs, villages. Présent dans 130 pays.", "Innsbruck", "Autriche", "https://www.sos-childrensvillages.org", "education"),
    (" SOS already french variant"),
]

# last dummy line to strip
ORGS = [o for o in ORGS if isinstance(o, tuple) and len(o) == 8]


def initials(name: str) -> str:
    parts = [p for p in name.replace("—", " ").replace("-", " ").split() if p[:1].isalpha()]
    if not parts:
        return "N"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[1][0]).upper()


def mark(slug: str, category: str, name: str) -> str:
    c = COLORS[category]
    k = sum(map(ord, slug)) % 5
    if category == "health":
        inner = f'<rect x="56" y="30" width="16" height="68" rx="4" fill="{c}"/><rect x="30" y="56" width="68" height="16" rx="4" fill="{c}"/>'
    elif category == "environment":
        inner = f'<path fill="{c}" d="M64 22 C98 40 110 74 64 108 C18 74 30 40 64 22 Z"/>'
    elif category == "animal":
        inner = (
            f'<circle cx="46" cy="40" r="11" fill="{c}"/><circle cx="82" cy="40" r="11" fill="{c}"/>'
            f'<circle cx="34" cy="68" r="9" fill="{c}"/><circle cx="94" cy="68" r="9" fill="{c}"/>'
            f'<circle cx="64" cy="80" r="20" fill="{c}"/>'
        )
    elif category == "education":
        inner = f'<path fill="{c}" d="M22 50 L64 28 L106 50 L64 72 Z"/><path fill="{c}" opacity=".75" d="M38 60 V86 C38 94 64 104 64 104 C64 104 90 94 90 86 V60 L64 72 Z"/>'
    elif category == "culture":
        inner = f'<path fill="{c}" d="M64 22 L100 64 L64 106 L28 64 Z"/>'
    elif category == "local":
        inner = f'<path fill="{c}" d="M22 66 L64 28 L106 66 V104 H78 V78 H50 V104 H22 Z"/>'
    elif k == 0:
        inner = f'<path fill="{c}" d="M64 98 L28 64 C18 54 18 38 30 30 C42 22 54 28 64 42 C74 28 86 22 98 30 C110 38 110 54 100 64 Z"/>'
    elif k == 1:
        inner = f'<circle cx="64" cy="64" r="34" fill="none" stroke="{c}" stroke-width="10"/>'
    elif k == 2:
        inner = f'<rect x="30" y="30" width="68" height="68" rx="8" fill="none" stroke="{c}" stroke-width="10"/>'
    else:
        inner = f'<path fill="{c}" d="M64 24 C78 42 96 52 96 74 C96 90 82 102 64 102 C46 102 32 90 32 74 C32 58 48 46 56 38 C52 56 64 58 64 24 Z"/>'
    letters = initials(name)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img">
  <rect width="128" height="128" rx="18" fill="#0b0906"/>
  <g transform="translate(0,-6)">{inner}</g>
  <text x="64" y="118" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="700" fill="#f4ecdf" letter-spacing="1">{letters}</text>
</svg>
'''


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def main() -> None:
    ORGS_DIR.mkdir(parents=True, exist_ok=True)
    slugs = [o[0] for o in ORGS]
    assert len(slugs) == len(set(slugs)), "duplicate slug"
    rows = []
    for slug, name, tagline, desc, city, country, website, category in ORGS:
        (ORGS_DIR / f"{slug}.svg").write_text(mark(slug, category, name), encoding="utf-8")
        rows.append(
            "('{uid}','{slug}','{name}','{tagline}','{desc}','{city}','{country}','{website}','{cat}','{wallet}',false,true,'{logo}',true)".format(
                uid=sql_escape(f"seed:{slug}"),
                slug=sql_escape(slug),
                name=sql_escape(name),
                tagline=sql_escape(tagline),
                desc=sql_escape(desc),
                city=sql_escape(city),
                country=sql_escape(country),
                website=sql_escape(website),
                cat=sql_escape(category),
                wallet=WALLET,
                logo=f"/orgs/{slug}.svg",
            )
        )
    sql = """-- Hosted directory wave 2: ~150 additional partner fiches.
-- Gifts still land on the Nexa FLY transparency wallet until each org claims its own.

insert into associations (
  user_id, slug, name, tagline, description, city, country, website,
  category, wallet_address, featured, published, logo_url, hosted
) values
{values}
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  city = excluded.city,
  country = excluded.country,
  website = excluded.website,
  category = excluded.category,
  wallet_address = excluded.wallet_address,
  logo_url = excluded.logo_url,
  hosted = excluded.hosted,
  published = true,
  updated_at = now();
""".format(values=",\n".join(rows))
    SQL_PATH.write_text(sql, encoding="utf-8")
    print(f"wrote {len(ORGS)} orgs -> {SQL_PATH}")


if __name__ == "__main__":
    main()

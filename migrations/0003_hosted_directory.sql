-- Hosted partner directory: gifts land on the Nexa FLY transparency wallet
-- until each organisation claims its own receiving address.

alter table associations drop constraint if exists associations_wallet_address_key;
create index if not exists associations_wallet_idx on associations (wallet_address);

alter table associations add column if not exists logo_url text not null default '';
alter table associations add column if not exists hosted boolean not null default false;

update associations
set hosted = false, logo_url = '/logo.png'
where slug = 'nexa-fly';

insert into associations (
  user_id, slug, name, tagline, description, city, country, website,
  category, wallet_address, featured, published, logo_url, hosted
) values
('seed:croix-rouge-francaise','croix-rouge-francaise','Croix-Rouge française','Secours, santé, urgence.','Première organisation humanitaire de France. Secours d’urgence, action sociale, santé, formation aux gestes qui sauvent.','Paris','France','https://www.croix-rouge.fr','health','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/croix-rouge-francaise.svg',true),
('seed:restos-du-coeur','restos-du-coeur','Les Restos du Cœur','Des millions de repas, chaque hiver.','Aide alimentaire, hébergement, insertion. Fondés par Coluche, les Restos du Cœur restent l’un des filets sociaux les plus visibles du pays.','Paris','France','https://www.restosducoeur.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/restos-du-coeur.svg',true),
('seed:secours-populaire','secours-populaire','Secours Populaire','Solidarité à toutes les échelles.','Aide alimentaire, vestimentaire, vacances, accès au droit. Un réseau de bénévoles dans toute la France.','Paris','France','https://www.secourspopulaire.fr','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/secours-populaire.svg',true),
('seed:secours-catholique','secours-catholique','Secours Catholique — Caritas France','La pauvreté n’est pas une fatalité.','Réseau Caritas : accompagnement des personnes en précarité, plaidoyer, urgence internationale.','Paris','France','https://www.secours-catholique.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/secours-catholique.svg',true),
('seed:msf-france','msf-france','Médecins Sans Frontières','Soigner là où les autres ne vont plus.','Association médicale d’urgence. Conflits, épidémies, exclusions de soins — indépendance et témoignage.','Paris','France','https://www.msf.fr','health','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/msf-france.svg',true),
('seed:unicef-france','unicef-france','UNICEF France','Chaque enfant, partout.','Comité français de l’UNICEF : survie, éducation, protection de l’enfance, urgences.','Paris','France','https://www.unicef.fr','education','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/unicef-france.svg',true),
('seed:fondation-abbe-pierre','fondation-abbe-pierre','Fondation Abbé Pierre','Mal-logement, un combat public.','Plaidoyer et terrain contre le mal-logement. Rapport annuel, pensions de famille, urgences hivernales.','Paris','France','https://www.fondation-abbe-pierre.fr','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/fondation-abbe-pierre.svg',true),
('seed:emmaus-france','emmaus-france','Emmaüs France','Accueillir, collecter, travailler.','Communautés, ressourceries, lutte contre la pauvreté. Le geste du don d’objet finance l’accueil.','Montreuil','France','https://emmaus-france.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/emmaus-france.svg',true),
('seed:humanite-inclusion','humanite-inclusion','Humanité & Inclusion','Handicap, mines, urgence.','Anciennement Handicap International. Réadaptation, lutte anti-mines, inclusion, crises.','Lyon','France','https://www.hi.org','health','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/humanite-inclusion.svg',true),
('seed:spa','spa','SPA','Protéger les animaux, depuis 1845.','Refuges, fourrières, plaidoyer. La plus ancienne protection animale de France.','Paris','France','https://www.la-spa.fr','animal','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/spa.svg',true),
('seed:ligue-contre-le-cancer','ligue-contre-le-cancer','Ligue contre le cancer','Recherche, patients, prévention.','Première association de bénévoles contre le cancer. Soins de support, recherche, information.','Paris','France','https://www.ligue-cancer.net','health','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/ligue-contre-le-cancer.svg',true),
('seed:action-contre-la-faim','action-contre-la-faim','Action contre la Faim','Faim, malnutrition, eau.','ONG française d’envergure mondiale. Nutrition, eau, santé, sécurité alimentaire.','Paris','France','https://www.actioncontrelafaim.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/action-contre-la-faim.svg',true),
('seed:wwf-france','wwf-france','WWF France','La nature n’est pas un luxe.','Conservation, climat, océans, forêts. Le panda du WWF, au service d’un vivant encore là.','Paris','France','https://www.wwf.fr','environment','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/wwf-france.svg',true),
('seed:amnesty-france','amnesty-france','Amnesty International France','Les droits humains, sans exception.','Enquêtes, campagnes, urgences. Un réseau de membres qui écrit, manifeste, documente.','Paris','France','https://www.amnesty.fr','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/amnesty-france.svg',true),
('seed:sos-mediterranee','sos-mediterranee','SOS Méditerranée','Secourir en mer, témoigner à terre.','Sauvetage en Méditerranée centrale. Civile, européenne, indépendante.','Marseille','France','https://www.sosmediterranee.fr','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/sos-mediterranee.svg',true),
('seed:afm-telethon','afm-telethon','AFM-Téléthon','Maladies rares, un marathon.','Téléthon, Généthon, thérapies géniques. Une association de malades devenue puissance scientifique.','Évry','France','https://www.afm-telethon.fr','health','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/afm-telethon.svg',true),
('seed:petits-freres-des-pauvres','petits-freres-des-pauvres','Petits Frères des Pauvres','Personne âgée, personne isolée.','Lutte contre l’isolement des aînés. Visites, vacances, fin de vie.','Paris','France','https://www.petitsfreresdespauvres.fr','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/petits-freres-des-pauvres.svg',true),
('seed:care-france','care-france','CARE France','Pauvreté, climat, égalité.','ONG internationale née de colis de l’après-guerre. Aujourd’hui : crises, femmes, climat.','Paris','France','https://www.carefrance.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/care-france.svg',true),
('seed:medecins-du-monde','medecins-du-monde','Médecins du Monde','Soigner ici et là-bas.','Missions internationales et centres de soins en France, y compris auprès des exclus du système.','Paris','France','https://www.medecinsdumonde.org','health','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/medecins-du-monde.svg',true),
('seed:fondation-de-france','fondation-de-france','Fondation de France','Le mécénat de ceux qui agissent.','Première fondation philanthropique française. Elle abrite des centaines de fondations abritées.','Paris','France','https://www.fondationdefrance.org','other','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/fondation-de-france.svg',true),
('seed:unicef','unicef','UNICEF','Enfance, partout dans le monde.','Fonds des Nations Unies pour l’enfance. Vaccins, école, protection, urgences.','New York','États-Unis','https://www.unicef.org','education','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/unicef.svg',true),
('seed:cicr','cicr','CICR','Guerre, droit, humanité.','Comité international de la Croix-Rouge. Droit international humanitaire, visites de détenus, urgences armées.','Genève','Suisse','https://www.icrc.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/cicr.svg',true),
('seed:unhcr','unhcr','HCR — UNHCR','Réfugiés, asile, retour.','Agence des Nations Unies pour les réfugiés. Protection juridique, camps, réinstallation.','Genève','Suisse','https://www.unhcr.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/unhcr.svg',true),
('seed:pam','pam','PAM — WFP','Nourrir, en urgence et au long cours.','Programme alimentaire mondial. Prix Nobel 2020. Faim, logistique, écoles.','Rome','Italie','https://www.wfp.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/pam.svg',true),
('seed:oxfam','oxfam','Oxfam','Inégalités, crises, justice.','Confédération internationale. Aide d’urgence et plaidoyer contre les inégalités.','Nairobi','Kenya','https://www.oxfam.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/oxfam.svg',true),
('seed:save-the-children','save-the-children','Save the Children','Des enfants, pas des collatéraux.','Éducation, santé, protection dans les conflits et les catastrophes.','Londres','Royaume-Uni','https://www.savethechildren.net','education','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/save-the-children.svg',true),
('seed:msf','msf','MSF International','Médecins Sans Frontières, le mouvement.','Le réseau international MSF. Indépendance médicale, urgences, témoignage.','Genève','Suisse','https://www.msf.org','health','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/msf.svg',true),
('seed:wwf','wwf','WWF','Le vivant, un bilan.','Plus grand réseau de conservation. Espèces, habitats, climat.','Gland','Suisse','https://www.worldwildlife.org','environment','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/wwf.svg',true),
('seed:amnesty','amnesty','Amnesty International','Lettre, enquête, rue.','Mouvement mondial pour les droits humains. Prisonniers d’opinion, armes, discriminations.','Londres','Royaume-Uni','https://www.amnesty.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/amnesty.svg',true),
('seed:islamic-relief','islamic-relief','Islamic Relief','Foi, secours, développement.','ONG humanitaire née à Birmingham. Urgences, orphelins, eau, Ramadan.','Birmingham','Royaume-Uni','https://www.islamic-relief.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/islamic-relief.svg',true),
('seed:irc','irc','International Rescue Committee','De la guerre à la relance.','Réfugiés, santé, éducation, relèvement économique. Fondé par Einstein en 1933.','New York','États-Unis','https://www.rescue.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/irc.svg',true),
('seed:plan-international','plan-international','Plan International','Filles, droits, éducation.','Développement communautaire et droits des enfants, en particulier des filles.','Woking','Royaume-Uni','https://plan-international.org','education','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/plan-international.svg',true),
('seed:habitat-for-humanity','habitat-for-humanity','Habitat for Humanity','Un toit, une dignité.','Construction et rénovation de logements avec les familles. Réseau mondial de bénévoles.','Atlanta','États-Unis','https://www.habitat.org','solidarity','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/habitat-for-humanity.svg',true),
('seed:direct-relief','direct-relief','Direct Relief','Médicaments là où ça manque.','Aide médicale d’urgence et chronique. Entrepôts, last mile, sans frais aux soignants.','Santa Barbara','États-Unis','https://www.directrelief.org','health','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/direct-relief.svg',true),
('seed:nature-conservancy','nature-conservancy','The Nature Conservancy','Protéger la terre et l’eau.','Conservation par l’achat, la science, les partenariats. Forêts, côtes, climat.','Arlington','États-Unis','https://www.nature.org','environment','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/nature-conservancy.svg',true),
('seed:greenpeace','greenpeace','Greenpeace','Témoins, pas spectateurs.','Campagnes océan, climat, forêts, nucléaire. Action non-violente, indépendance des États.','Amsterdam','Pays-Bas','https://www.greenpeace.org','environment','bosnEo1BZdm3M9mHu9NdeWkuBwDuvtF7wJ3Eo7gmhwT',false,true,'/orgs/greenpeace.svg',true)
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

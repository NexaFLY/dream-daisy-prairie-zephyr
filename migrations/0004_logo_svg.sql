-- Prefer geometric marks over photo-of-logo PNGs.
update associations
set logo_url = regexp_replace(logo_url, '\.png$', '.svg')
where hosted = true and logo_url like '/orgs/%.png';

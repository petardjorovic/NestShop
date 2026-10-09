-- This is an empty migration.

CREATE VIEW article_current_price AS
SELECT DISTINCT ON (article_id)
    article_id,
    article_price_id,
    price,
    created_at
FROM article_price
ORDER BY
    article_id,
    created_at DESC,
    article_price_id DESC;
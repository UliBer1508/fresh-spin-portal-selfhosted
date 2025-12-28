-- Update alle Bestellungen ohne item_variants mit den Farben aus linen_set_definitions
UPDATE linen_orders lo
SET item_variants = extracted.extracted_variants,
    linen_color = NULL
FROM (
  SELECT 
    lo2.id as order_id,
    jsonb_object_agg(
      key,
      value->>'color'
    ) FILTER (WHERE value->>'color' IS NOT NULL) as extracted_variants
  FROM linen_orders lo2
  LEFT JOIN linen_set_definitions lsd ON lo2.house_id = lsd.house_id,
  LATERAL jsonb_each(lsd.custom_categories) AS items(key, value)
  WHERE lo2.item_variants IS NULL
  AND lsd.custom_categories IS NOT NULL
  GROUP BY lo2.id
) extracted
WHERE lo.id = extracted.order_id
AND lo.item_variants IS NULL;
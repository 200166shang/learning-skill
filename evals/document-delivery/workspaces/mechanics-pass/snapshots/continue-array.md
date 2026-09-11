# Radar data model

## Angles and array positions

For a scan from -90° through +90° in 30° steps, the seven positions are
`[-90, -60, -30, 0, +30, +60, +90]`. Zero-based indexing gives +30° index 4:
count from -90 as `(30 - (-90)) / 30 = 4`. Message angle fields are radians.

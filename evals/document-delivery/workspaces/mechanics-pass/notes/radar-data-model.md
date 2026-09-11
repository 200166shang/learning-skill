# Radar data model

## Angles and array positions

For a scan from -90° through +90° in 30° steps, the seven positions are
`[-90, -60, -30, 0, +30, +60, +90]`. Zero-based indexing gives +30° index 4:
count from -90 as `(30 - (-90)) / 30 = 4`. Message angle fields
are radians, so production code uses radians even though this example labels degrees.

If that index was unclear, imagine seven labeled boxes numbered 0 through 6;
the fifth box is numbered 4. This explanation extends the same section.

## Time, motion, and frames

The timestamp is split into `sec` whole seconds and `nsec` fractional
nanoseconds. It means acquisition time of the first ray, not simply message
reception time. On a moving robot, later rays come from later poses; assigning
all rays the reception-time pose bends or shifts the reconstructed scene.
Acquisition-to-reception difference includes buffering, scheduling, and
processing, so it must not be called pure network latency.

`frame_id` identifies the coordinate frame containing the measurements. It is
not itself a transform. TF provides the transform from the sensor frame to the
robot base or map frame.

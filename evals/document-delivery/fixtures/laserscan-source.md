# Laser scan source excerpt (sanitized)

This fixture is a small, synthetic teaching source. It contains no user names,
machine paths, or copied conversation text.

A scan spans -90 degrees through +90 degrees, inclusive, in 30 degree steps.
It therefore has seven samples. With zero-based indexing, +30 degrees is sample
index 4. Middleware messages store angles in radians even when a teaching
example is easier to read in degrees.

The message timestamp is split into whole seconds (`sec`) and fractional
nanoseconds (`nsec`). The header timestamp denotes the acquisition time of the
first ray. If the platform moves during a scan, later rays were acquired at
later poses; treating every ray as if it came from the reception-time pose can
distort the reconstructed scene. The difference between acquisition and
reception is not necessarily pure network latency: buffering, scheduling, and
processing can contribute.

`frame_id` names the coordinate frame in which scan measurements are expressed.
It is an identifier, not a transform. The transform tree (TF) supplies the
spatial relationship to frames such as the robot base or map.

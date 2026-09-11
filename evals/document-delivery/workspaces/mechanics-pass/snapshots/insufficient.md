# Radar data model

For -90° through +90° in 30° steps there are seven samples; +30° is index 4.
Message angles are radians.

The timestamp splits into `sec` and `nsec` and identifies acquisition time of
the first ray. On a moving robot, later rays have later poses, so using one pose
can distort the scene. The delay is not pure network latency because buffering,
scheduling, and processing also contribute. `frame_id` identifies a coordinate
frame; TF provides its transform to the robot or map.

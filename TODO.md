# TODO List

* Add validation
  * Titles should have a title attribute
  * Title attribute should point to a valid exe, if not warn and skip
* Add minify option to config
* Tell user how long it took
* Add config.yml options
  * List of manifest files to search for
* Add README with instructions for SRM
* Add LICENSE
* Support Windows context menu-copied paths
* Add proper CLI
  * Auto-add based on path to exe
* Support linting normal JSON SRM manifests
* If outputting to jsonc, add comments for other data from session + date
* Support outputting individual title manifests
* Support the the reverse, converting your existing manifest.json into a .yml manifest
* Only mandatory properties of a manifest input should be output and titles, the latter must be valid
  * Ensure attributes name and directory CAN be ommitted, even if not recommended for ease of use
  * Then files can be roughly cut in half from .json to .yml
* Support other SRM manifest options, check SRM program
curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/bidding_backend_flowz:dev","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["3035:3035/tcp"],"version": "edcd12d5-6147-4054-a806-c9cc94cac1cd","environment": {"RDB_HOST": "aws-us-east-1-portal.30.dblayer.com","RDB_PORT": "16868","rauth": "51b2885598be1c2c1243a5c9c3548ad2","cert": "/cacert"}}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s253?action=upgrade'

function createSkyPlane() {
    let material = new THREE.MeshLambertMaterial({
		color: 0xff0000,
		side: THREE.DoubleSide
    });

    material.transparent = true;
    material.opacity = 0.5;   
	let skyPlane = new THREE.Group();
	skyPlane.name = "skyPlane";
    skyPlane = createTiles(100, 100, 0, 0, material, skyPlane);

    return skyPlane;
}


function createSkyTiles(width, height, posX, posZ, material, group) {
	let geometry;
	let mesh;

	posX = posX+(-(width / 2)+0.5);
	posZ = posZ+(-(height / 2)+0.5);

	for (x = 0; x < width; x++) {
		for (z = 0; z < height; z++) {
            geometry = new THREE.BoxGeometry(1, 1, 1);
			mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(posX + x, 0, posZ + z);
			group.add(mesh);
		}
	}
	return group;
}


// function to compute the landmark visibility
let computeSkyVisability = function() {
    let skyPlane = scene.getObjectByName("skyPlane");

    let origin = skyIndicator.position.clone();

    skyPlane.visible = true;
    let total = 0;
    let visible = 0;
    let score = 0;

	skyPlane.traverse(function (tile) {
        total += 1;

        let direction = new THREE.Vector3();
        let destination = new THREE.Vector3().copy(tile.position);
        destination.y = 100;

        direction.subVectors( destination, origin ).normalize();

        let intersects = getIntersections(origin, direction, buildings.children);
        tile.visible = true;
        if (intersects[0]) {
            tile.visible = false;
        }
        else{
            visible += 1;
        }
    });
    score = (visible/total)*100;
    return(parseInt(score));
};
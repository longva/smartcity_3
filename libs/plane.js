function createPlane() {
	let materialSoil = new THREE.MeshLambertMaterial({
		color: 0x676767,
		side: THREE.DoubleSide
	});
	let materialStreets = new THREE.MeshLambertMaterial({
		color: 0x404040,
		side: THREE.DoubleSide
	});
	let materialPark = new THREE.MeshLambertMaterial({
		color: 0x00ff00,
		side: THREE.DoubleSide
	});

	var imageFile = "grass.jpg";
	var text = THREE.ImageUtils.loadTexture("../textures/" + imageFile);
	materialPark.map = text;


	let ground = new THREE.Group();
	ground.name = "ground";
	let soil = new THREE.Group();
	soil.name = "soil";
	let streets = new THREE.Group();
	streets.name = "streets";
	let park = new THREE.Group();
	park.name = "park";

	soil = createTiles(20, 20, -25, -25, materialSoil, soil);
	soil = createTiles(20, 20, -25, 0, materialSoil, soil);
    soil = createTiles(20, 20, -25, 25, materialSoil, soil);
    
    soil = createTiles(20, 20, 0, -25, materialSoil, soil);
    park = createTiles(20, 20, 0, 0, materialPark, park);
    soil = createTiles(20, 20, 0, 25, materialSoil, soil);
    
	soil = createTiles(20, 20, 25, -25, materialSoil, soil);
	soil = createTiles(20, 20, 25, 0, materialSoil, soil);
	soil = createTiles(20, 20, 25, 25, materialSoil, soil);

    streets = createTiles(70, 5, 0, -12.5, materialStreets, streets);
    streets = createTiles(70, 5, 0, 12.5, materialStreets, streets);
    streets = createTiles(5, 70, -12.5, 0, materialStreets, streets);
	streets = createTiles(5, 70, 12.5, 0, materialStreets, streets);

	ground.add(soil);
	ground.add(streets);
	ground.add(park);

	return ground;
}

function createTiles(width, height, posX, posZ, material, group) {
	let geometry;
	let mesh;

	posX = posX+(-(width / 2)+0.5);
	posZ = posZ+(-(height / 2)+0.5);

	for (x = 0; x < width; x++) {
		for (z = 0; z < height; z++) {
            geometry = new THREE.BoxGeometry(1, 0.1, 1);
			mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(posX + x, 0, posZ + z);
			mesh.receiveShadow = true;
			group.add(mesh);
		}
	}
	return group;
}

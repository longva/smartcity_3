
let addCube = function(xPos, zPos, width, heigth, depth, texture) {
	var cubeGeometry = new THREE.BoxGeometry(width, heigth, depth);

	var mat = new THREE.MeshPhongMaterial();

	var imageFile = "brick-wall.jpg";

	if (parseInt(texture) == 0) {
	} else {
		switch (parseInt(texture)) {
			case 1:
				imageFile = "metal-rust.jpg";
				break;
			case 2:
				imageFile = "floor-wood.jpg";
				break;
			case 3:
				imageFile = "stone.jpg";
				break;
			case 4:
				imageFile = "brick-wall.jpg";
				break;
			default:
				imageFile = "stone.jpg";
		}

        //var text = THREE.ImageUtils.loadTexture("../textures/" + imageFile);
        var text = new THREE.TextureLoader().load("../smartcity/textures/" + imageFile);
		var mat = new THREE.MeshPhongMaterial();
		mat.map = text;
	}

	var cube = new THREE.Mesh(cubeGeometry, mat);
    cube.castShadow = true;
    cube.receiveShadow = true;
	buildingNumber += 1;
	cube.name = "cube-" + buildingNumber;

	cube.position.x = xPos;
	cube.position.y = heigth / 2;
	cube.position.z = zPos;

	// add the cube to the scene
	buildings.add(cube);
};


function initBuildings() {
    var xPos;
    var zPos;
    var width = 3;
    var minheigth = 12;
    var addheigth = 5;
    var depth = 4;
    var texture = 0;

    xPos = -30;
    zPos = -31;
    for (x = 0; x < 2; x++) {
		for (z = 0; z < 3; z++) {
            addCube(xPos + x*(width + 2), zPos + z*(depth + 2), width, Math.round(minheigth + Math.random() * addheigth), depth, Math.floor(Math.random() * 5));
        }
    }
    xPos = -30;
    zPos = -6;
    for (x = 0; x < 2; x++) {
		for (z = 0; z < 3; z++) {
            addCube(xPos + x*(width + 2), zPos + z*(depth + 2), width, Math.round(minheigth + Math.random() * addheigth), depth, Math.floor(Math.random() * 5));
        }
    }
    xPos = -30;
    zPos = 19;
    for (x = 0; x < 2; x++) {
		for (z = 0; z < 3; z++) {
            addCube(xPos + x*(width + 2), zPos + z*(depth + 2), width, Math.round(minheigth + Math.random() * addheigth), depth, Math.floor(Math.random() * 5));
        }
    }

    xPos = 25;
    zPos = -31;
    for (x = 0; x < 2; x++) {
		for (z = 0; z < 3; z++) {
            addCube(xPos + x*(width + 2), zPos + z*(depth + 2), width, Math.round(minheigth + Math.random() * addheigth), depth, Math.floor(Math.random() * 5));
        }
    }
    xPos = 25;
    zPos = -6;
    for (x = 0; x < 2; x++) {
		for (z = 0; z < 3; z++) {
            addCube(xPos + x*(width + 2), zPos + z*(depth + 2), width, Math.round(minheigth + Math.random() * addheigth), depth, Math.floor(Math.random() * 5));
        }
    }
    xPos = 25;
    zPos = 19;
    for (x = 0; x < 2; x++) {
		for (z = 0; z < 3; z++) {
            addCube(xPos + x*(width + 2), zPos + z*(depth + 2), width, Math.round(minheigth + Math.random() * addheigth), depth, Math.floor(Math.random() * 5));
        }
    }

    xPos = -5;
    zPos = 20;
    width = 6;
    depth = 6;
    for (x = 0; x < 2; x++) {
		for (z = 0; z < 2; z++) {
            addCube(xPos + x*(width + 4), zPos + z*(depth + 4), width, Math.round(minheigth + Math.random() * addheigth), depth, Math.floor(Math.random() * 5));
        }
    }
    xPos = 0;
    zPos = -25;
    width = 8;
    depth = 8;
    addCube(xPos, zPos, width, minheigth+addheigth+5, depth, Math.floor(Math.random() * 5));
}
function addIntensityBars(intensityBarGroup) {
	for (let i = 0; i < 12; i++) {
		let intensityBar = createIntensityBar(i.toString());
		intensityBar.visible = false;
		intensityBarGroup.add(intensityBar);
	}

	intensityBarGroup.children[0].position.x = -25;
	intensityBarGroup.children[1].position.x = -25;
	intensityBarGroup.children[2].position.x = -12.5;
	intensityBarGroup.children[3].position.x = -12.5;
	intensityBarGroup.children[4].position.x = -12.5;
	intensityBarGroup.children[5].position.x = 0;
	intensityBarGroup.children[6].position.x = 0;
	intensityBarGroup.children[7].position.x = 12.5;
	intensityBarGroup.children[8].position.x = 12.5;
	intensityBarGroup.children[9].position.x = 12.5;
	intensityBarGroup.children[10].position.x = 25;
	intensityBarGroup.children[11].position.x = 25;

	intensityBarGroup.children[2].position.z = -25;
	intensityBarGroup.children[7].position.z = -25;
	intensityBarGroup.children[0].position.z = -12.5;
	intensityBarGroup.children[5].position.z = -12.5;
	intensityBarGroup.children[10].position.z = -12.5;
	intensityBarGroup.children[3].position.z = 0;
	intensityBarGroup.children[8].position.z = 0;
	intensityBarGroup.children[1].position.z = 12.5;
	intensityBarGroup.children[6].position.z = 12.5;
	intensityBarGroup.children[11].position.z = 12.5;
	intensityBarGroup.children[4].position.z = 25;
	intensityBarGroup.children[9].position.z = 25;

	intensityBarGroup.position.y = 5;

	return intensityBarGroup;
}

function createIntensityBar(barNumber) {
	let group = new THREE.Group();
	group.name = "bar" + barNumber;

	let material1 = new THREE.MeshBasicMaterial({
		color: 0x00ccff,
		transparent: true,
		opacity: 0.3
	});

	let geometry1 = new THREE.BoxGeometry(0.5, 1, 0.5);
	let mesh1 = new THREE.Mesh(geometry1, material1);
	mesh1.position.set(0, 0, 0);
	group.add(mesh1);

	let material2 = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		transparent: true,
		opacity: 0.3
	});

	let geometry2 = new THREE.BoxGeometry(0.5, 1, 0.5);
	let mesh2 = new THREE.Mesh(geometry2, material2);
	mesh2.position.set(0, 0, 0);
	group.add(mesh2);

	return group;
}

function updateIntensityBar(group, height, light) {
	let scale = light.intensity;

	if (checkIntersections(group, light)) {
		scale = 0.001;
	}

	if (scale < 0.001) {
		scale = 0.001;
	}
	if (scale > 0.999) {
		scale = 0.999;
	}

	let mesh1 = group.children[0];
	let mesh2 = group.children[1];

	mesh1.scale.y = height * scale;
	mesh2.scale.y = height * (1 - scale);
	mesh1.position.y = (height / 2) * scale;
	mesh2.position.y = height - (height / 2) * (1 - scale);

	return group;
}

function checkIntersections(group, light) {
	let result = false;
	let direction = getSunDirection(light);

	let origin = group.position.clone();
	origin.y = 1;



	let intersects = getIntersections(origin, direction, buildings.children);

	if (intersects.length > 0) {
		result = true;
	}

	return result;
}

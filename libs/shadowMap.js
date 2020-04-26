// function to compute a single shadow map
let computeShadowMap = function(light, enableLines) {
	let direction = getSunDirection(light);
	let shadowArray = [];
	let park = scene.getObjectByName("park");
	park.children.forEach(function(item) {
		let intersects = getIntersections(item.position, direction, buildings.children);
		let value = 1;
		if (intersects.length > 0) {
			// In shadow
			value = 0;
			if (enableLines) createLine(new THREE.Vector3().copy(item.position), direction, intersects[0].distance);
		}
		shadowArray.push(value);
	});
	return shadowArray;
};

// function to convert 1D array into 2D array
let convertArray1Dto2D = function(arr, sizeX) {
	let newArr = [];
	while (arr.length) newArr.push(arr.splice(0, sizeX).reverse());
	return newArr;
};
// function to create pattern heatmap
let createPatternMap = function(countEnabled = false) {
	let text = elements.findPatternInput.value;
	text = text ? text : "101"; // default value
	let resoulution = parseInt(elements.resoulutioninput.value);
	let changeMap = computeChanges(resoulution);
	let patternMap = findPattern(changeMap, text, countEnabled);
	let arr2D = convertArray1Dto2D(patternMap, 20);
	updateHeatmap(arr2D);
};
// function to create/update the heatmap
let updateHeatmap = function(arr2D) {
	let data = [
		{
			z: arr2D,
			type: "heatmap",
			transpose: true
		}
	];
	Plotly.newPlot("myDiv", data);
};

// function to get the direction of the sun
let getSunDirection = function(light) {
	let direction = new THREE.Vector3();

	if (light instanceof THREE.DirectionalLight) {
		direction.subVectors(light.position, direction).normalize();
	} else {
		direction.subVectors(light, direction).normalize();
	}
	return direction;
};
// function to compute several shadow maps
let computeChanges = function(numberOfSteps) {
	let changeMap = [];
	const stepSize = 360 / numberOfSteps;
	let angle = 90;

	for (let i = 0; i < numberOfSteps; i++) {
		let angleRad = (angle * Math.PI) / 180;
		light.position.x = 100 * Math.sin(angleRad);
		light.position.z = 100 * Math.cos(angleRad);
		changeMap.push(computeShadowMap(light, false));
		angle += stepSize;
	}
	return changeMap;
};

// function to compute a shadow variation over time
let computeShadowVariatons = function(array3D) {
	let array2D = Array(array3D[0].length).fill(0);
	for (let i = 0; i < array3D.length; i++) {
		const map = array3D[i];
		for (let j = 0; j < map.length; j++) {
			if (map[j]) array2D[j] += 1;
		}
	}
	return array2D;
};
// function to find pattern or pattern variation
let findPattern = function(array3D, pattern, variation = false) {
	let array2DString = Array(array3D[0].length).fill("");
	let array2D = Array(array3D[0].length).fill(0);

	for (let i = 0; i < array3D.length; i++) {
		const map = array3D[i];
		for (let j = 0; j < map.length; j++) {
			if (map[j]) array2DString[j] += "1";
			else array2DString[j] += "0";
		}
	}

	if (variation) {
		let reg = new RegExp(pattern, "g");
		array2DString.forEach((element, index) => {
			array2D[index] = element.match(reg);
			let found = element.match(reg);
			if (found) array2D[index] = found.length;
			else array2D[index] = 0;
		});
	} else {
		array2DString.forEach((element, index) => {
			let n = element.includes(pattern);
			if (n) array2D[index] = 1;
		});
	}

	return array2D;
};
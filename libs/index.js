"use strict";

let scene, camera, light, gridHelper, renderer;
let orbitControls;

let editMode = false;
let buildingNumber = 0;
let selectedID = 0;
let selectedLandmarkID = 0;
let selectedGroundID = 0;
let buildings;
let landmarkIndicator;
let skyIndicator, skyPlane;
let skySelectionActive = false;
let intensityBarGroup;

// variables for computing landmark visibility
let houseNumber = 0,
	totalHits = 0,
	score = 0;
let houseHits = [];
// variables for sun rotation
let ADD = 0.01,
	theta = Math.PI,
	toggleAnimation = false,
	animationStep = 0;

// once everything is loaded, we run our Three.js stuff.
function init() {
	var clock = new THREE.Clock();

	elements.removeBuilding.disabled = true;
	elements.updateBuilding.disabled = true;
	elements.selectLandmark.disabled = true;

	// create a scene, that will hold all our elements such as objects, cameras and lights.
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xffffee);
	buildings = new THREE.Group();
	buildings.name = "buildings";
	scene.add(buildings);

	// create a camera, which defines where we're looking at.
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);

	renderer = new THREE.WebGLRenderer({ antialias: true, canvas: elements.canvas });
	elements.canvas.addEventListener("mousedown", onDocumentMouseDown, false);
	renderer.setClearColor(new THREE.Color(0xffffee, 1.0));
	//renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	// position and point the camera to the center of the scene
	camera.position.x = 100;
	camera.position.y = 100;
	camera.position.z = 100;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	orbitControls = new THREE.OrbitControls(camera);
	var clock = new THREE.Clock();

	// create grid helper
	gridHelper = new THREE.GridHelper(35, 1);
	gridHelper.material.visible = false;
	gridHelper.position.y = 0.1;
	scene.add(gridHelper);

	// create the ground plane
	var plane = createPlane();
	scene.add(plane);

	skyPlane = createSkyPlane();
	skyPlane.position.y = 100;
	skyPlane.visible = false;
	scene.add(skyPlane);

	initBuildings();

	// create a sphere to use as ladmark indicator
	var sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
	var sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
	landmarkIndicator = new THREE.Mesh(sphereGeometry, sphereMaterial);
	selectedLandmarkID = buildings.children[buildings.children.length - 1].id;
	updateLandmarkIndicator();

	// add the sphere to the scene
	scene.add(landmarkIndicator);

	// create a sphere to use as ladmark indicator
	var sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
	var sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
	skyIndicator = new THREE.Mesh(sphereGeometry, sphereMaterial);
	selectedGroundID = plane.getObjectByName("streets").children[0].id;
	skyIndicator.position.x = scene.getObjectById(selectedGroundID).position.x;
	skyIndicator.position.z = scene.getObjectById(selectedGroundID).position.z;

	// add the sphere to the scene
	scene.add(skyIndicator);

	intensityBarGroup = new THREE.Group();
	intensityBarGroup.name = "intensityBars";
	intensityBarGroup = addIntensityBars(intensityBarGroup);
	scene.add(intensityBarGroup);

	loadTerrain();

	// add light
	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(100, 70, 0);
	light.castShadow = true;
	light.shadow.camera.near = 2;
	light.shadow.camera.far = 200;
	light.shadow.camera.left = -50;
	light.shadow.camera.right = 50;
	light.shadow.camera.top = 50;
	light.shadow.camera.bottom = -50;

	light.distance = 200;
	light.intensity = 1.0;
	light.shadow.mapSize.height = 1024;
	light.shadow.mapSize.width = 1024;

	scene.add(light);

	let ambiLight = new THREE.AmbientLight(0x1a1a1a);
	scene.add(ambiLight);

	render();

	function render() {
		// change position of directional light if animation is enabled
		if (toggleAnimation) {
			light.position.x = 100 * Math.sin(theta);
			light.position.z = 100 * Math.cos(theta);
			light.intensity = 0.5 + Math.sin(theta) * 0.5;
			theta += ADD;

			intensityBarGroup.children.forEach((intensityBar) => {
				intensityBar.visible = true;
				updateIntensityBar(intensityBar, 3, light);
			});

			switch (animationStep) {
				case 0:
					camera.position.x = 100;
					camera.position.y = 100;
					camera.position.z = 100;
					animationStep = 1;
					break;
				case 1:
					camera.position.x = 100 * Math.cos(theta);
					camera.position.z = 100 * Math.sin(theta);
					if (theta > Math.PI * 2.5) {
						animationStep = 2;
					}
					break;
				case 2:
					camera.position.y -= 0.2;
					if (camera.position.y < 60) {
						animationStep = 3;
					}
					break;
				case 3:
					camera.position.z -= 0.2;
					if (camera.position.z < 60) {
						animationStep = 4;
					}
					break;
				default:
				// code block
			}
		} else {
			light.intensity = 1;
			animationStep = 0;
			theta = Math.PI;
		}

		// render using requestAnimationFrame
		var delta = clock.getDelta();
		orbitControls.update(delta);
		resizeCanvasToDisplaySize();
		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}
}
window.onload = init;

function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// function that makes it possible to resize the window
function resizeCanvasToDisplaySize() {
	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	if (canvas.width !== width || canvas.height !== height) {
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}
}

function onDocumentMouseDown(event) {
	let rect = elements.canvas.getBoundingClientRect();
	var vector = new THREE.Vector3(
		((event.clientX - rect.left) / rect.width) * 2 - 1,
		-((event.clientY - rect.top) / rect.height) * 2 + 1,
		0.5
	);

	vector = vector.unproject(camera);
	var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
	var intersects = raycaster.intersectObjects(buildings.children);

	unSelect();
	clearEditor();
	if ((intersects.length > 0) & editMode) {
		if (intersects[0].object.name.substring(0, 4) == "cube") {
			selectedID = intersects[0].object.id;

			elements.removeBuilding.disabled = false;
			elements.updateBuilding.disabled = false;
			elements.selectLandmark.disabled = false;

			intersects[0].object.material.transparent = true;
			intersects[0].object.material.opacity = 0.5;
			updateEditor(intersects[0].object);
		}
	}

	if (skySelectionActive) {
		var streets = scene.getObjectByName("streets");
		var intersectsStreets = raycaster.intersectObjects(streets.children);
		if ((intersectsStreets.length > 0) & editMode) {
			skyIndicator.position.x = intersectsStreets[0].object.position.x;
			skyIndicator.position.z = intersectsStreets[0].object.position.z;
			console.log("x: " + skyIndicator.position.x + ", z: " + skyIndicator.position.z);
			selectedGroundID = intersectsStreets[0].object.id;
		}
		skySelectionActive = false;
	}
}

function unSelect() {
	selectedID = -1;
	elements.removeBuilding.disabled = true;
	elements.updateBuilding.disabled = true;
	elements.selectLandmark.disabled = true;
	buildings.children.forEach((object) => {
		if (object.name.substring(0, 4) == "cube") {
			object.material.transparent = false;
			object.material.opacity = 1.0;
		}
	});
}

function updateEditor(object) {
	document.getElementById("selected_building").innerText = "Selected Building: " + object.name.substring(5);
	document.getElementById("pos_x").value = object.position.x.toString();
	document.getElementById("pos_z").value = object.position.z.toString();
	document.getElementById("width").value = object.geometry.parameters.width.toString();
	document.getElementById("height").value = object.geometry.parameters.height.toString();
	document.getElementById("depth").value = object.geometry.parameters.depth.toString();

	var material = 0;

	if (object.material.map) {
		var str = object.material.map.image.src;
		if (str.includes("metal")) {
			material = 1;
		} else if (str.includes("wood")) {
			material = 2;
		} else if (str.includes("stone")) {
			material = 3;
		} else if (str.includes("brick")) {
			material = 4;
		}
	}
	document.getElementById("texture").options.selectedIndex = material;
}

function clearEditor() {
	document.getElementById("selected_building").innerText = "Selected Building: -";
	document.getElementById("pos_x").value = "0";
	document.getElementById("pos_z").value = "0";
	document.getElementById("width").value = "1";
	document.getElementById("height").value = "1";
	document.getElementById("depth").value = "1";
	document.getElementById("texture").options.selectedIndex = "0";
}

// listen to the resize events
//window.addEventListener("resize", onResize, false);

// elements in the HTML document
const elements = {
	canvas: document.querySelector(".city-view canvas"),
	visibilityBtn: document.querySelector(".visibility_btn"),
	clearLinesBtn: document.querySelector(".clear_btn"),
	animationStartBtn: document.querySelector(".start_animation"),
	shadowMapBtn: document.querySelector(".shadow_map_btn"),
	changesMapBtn: document.querySelector(".changes_map_btn"),
	findPatternBtn: document.querySelector(".find_pattern_btn"),
	findPatternVariationBtn: document.querySelector(".find_pattern_variation_btn"),
	displayTotalBuildings: document.querySelector(".total_buildings"),
	displayTotalHits: document.querySelector(".total_hits"),
	displayScore: document.querySelector(".visibility_score"),
	skyScore: document.querySelector(".sky_score"),
	resoulutioninput: document.querySelector(".resoulution_input"),
	findPatternInput: document.querySelector(".find_pattern_input"),
	toggleMode: document.querySelector(".toggle_mode_btn"),
	loadScene: document.querySelector(".load_scene_btn"),
	saveScene: document.querySelector(".save_scene_btn"),
	addBuilding: document.querySelector(".add_building_btn"),
	removeBuilding: document.querySelector(".remove_building_btn"),
	updateBuilding: document.querySelector(".update_building_btn"),
	selectLandmark: document.querySelector(".select_landmark_btn"),
	skyVisibility: document.querySelector(".sky_visibility_btn"),
	selectSky: document.querySelector(".select_sky_btn"),
};

// event listener for the toggleMode button
elements.toggleMode.addEventListener("click", () => {
	var play = document.querySelector(".play_mode");
	var edit = document.querySelector(".edit_mode");
	if (play.style.display === "none") {
		play.style.display = "flex";
		edit.style.display = "none";
		elements.toggleMode.innerHTML = "Edit Mode";
		editMode = false;
		orbitControls.enabled = true;
	} else {
		play.style.display = "none";
		edit.style.display = "flex";
		elements.toggleMode.innerHTML = "Play Mode";
		editMode = true;
		orbitControls.enabled = false;
	}
});

// event listener for the toggleMode button
elements.loadScene.addEventListener("click", () => {
	var json = localStorage.getItem("scene");
	var sceneLoader = new THREE.SceneLoader();

	sceneLoader.parse(
		JSON.parse(json),
		function (e) {
			scene = e.scene;
			// update referance to buildings
			if (scene.getObjectByName("buildings")) {
				buildings = scene.getObjectByName("buildings");
				var num = 0;
				if (buildings.children.length > 0) {
					buildings.children.forEach((building) => {
						if (num < parseInt(building.name.substring(5))) {
							num = parseInt(building.name.substring(5));
						}
					});
				}
				buildingNumber = num;
				loadTerrain();
			}
		},
		"."
	);
});

function loadTerrain() {
	var loader = new THREE.GLTFLoader();

	loader.load("../assets/models/map.glb", function (gltf) {
		var num = buildings.children.length + 1;

		gltf.scene.traverse(function (item) {
			if (item.type == "Mesh") {
				if (item.name != "EXPORT_GOOGLE_SAT_WM") {
					var geometry = new THREE.BufferGeometry().copy(item.geometry);
					var material = new THREE.MeshPhongMaterial();
					var mesh = new THREE.Mesh(geometry, material);
					num += 1;
					mesh.name = "cube-" + num;
					mesh.geometry.parameters = { width: 200, height: 200, depth: 200 };
					mesh.position.y = item.position.y;
					buildings.add(mesh);
				}
				else{
					scene.add(item);
				}
			}
		});

	});
}

async function getTest() {
	//const result = await fetch('file:///C:/computerGraphics/smartcity2/test.json');
	const result = await fetch("http://127.0.0.1:8887/defaultScene.json");
	const data = await result.json();
	console.log(data);
}
//getTest();

// event listener for the toggleMode button
elements.saveScene.addEventListener("click", () => {
	var exporter = new THREE.SceneExporter();
	var sceneJson = JSON.stringify(exporter.parse(scene));
	localStorage.setItem("scene", sceneJson);
	console.log("Scene Saved");
	console.log(localStorage.getItem("scene"));
});

// event listener for the toggleMode button
elements.addBuilding.addEventListener("click", () => {
	addBuilding();
});

// event listener for the toggleMode button
elements.removeBuilding.addEventListener("click", () => {
	removeBuilding();
	unSelect();
	clearEditor();
});

function addBuilding() {
	var xPos = document.getElementById("pos_x").value;
	var zPos = document.getElementById("pos_z").value;
	var width = document.getElementById("width").value;
	var heigth = document.getElementById("height").value;
	var depth = document.getElementById("depth").value;
	var texture = document.getElementById("texture").value;

	if (width * heigth * depth == 0) {
		alert("Unvalid size");
	} else {
		addCube(xPos, zPos, width, heigth, depth, texture);
	}
}

function removeBuilding() {
	var object = buildings.getObjectById(selectedID);
	buildings.remove(object);
}

// event listener for the toggleMode button
elements.updateBuilding.addEventListener("click", () => {
	addBuilding();
	removeBuilding();
});

// event listener for selecting landmark
elements.selectLandmark.addEventListener("click", () => {
	selectedLandmarkID = selectedID;

	//selectedLandmarkID = buildings.getObjectById(selectedID);
	console.log(selectedLandmarkID);
	updateLandmarkIndicator();
});

// keyboard codes
const KEYCODE_V = 86,
	KEYCODE_G = 71;
// event listener to capture key commands
document.addEventListener("keyup", keyCommands);
// function to handle key commands
function keyCommands(e) {
	if (e.keyCode == KEYCODE_V) {
		if (camera.type == "PerspectiveCamera") {
			camera = new THREE.OrthographicCamera(
				window.innerWidth / -16,
				window.innerWidth / 16,
				window.innerHeight / 16,
				window.innerHeight / -16,
				-200,
				500
			);
			camera.position.set(0, 200, 0);
			console.log("OrthographicCamera");
		} else {
			camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000); //fov, aspect, near, far
			camera.position.set(100, 100, 100);
			orbitControls = new THREE.OrbitControls(camera);
			console.log("PerspectiveCamera");
		}
		camera.lookAt(scene.position);
		camera.updateProjectionMatrix();
	}
	if (e.keyCode == KEYCODE_G) {
		if (gridHelper.material.visible) {
			gridHelper.material.visible = false;
		} else {
			gridHelper.material.visible = true;
		}
	}
}

// event listener for the start animation button
elements.animationStartBtn.addEventListener("click", () => {
	toggleAnimation = !toggleAnimation;
	elements.animationStartBtn.innerHTML = toggleAnimation ? "Stop Animation" : "Start Animation";
	if (!toggleAnimation) {
		intensityBarGroup.children.forEach((intensityBar) => {
			intensityBar.visible = false;
		});
	}
});

// event listener for the compute visibility button
elements.visibilityBtn.addEventListener("click", () => {
	clearLines();
	totalHits = 0;
	score = 0;
	computeLandmarkVisability();
	totalHits -= 1;
	var totalBuildings = buildings.children.length - 1;

	score = (totalHits / totalBuildings) * 100;
	elements.displayTotalBuildings.innerText = "Total Buildings: " + totalBuildings.toString();
	elements.displayTotalHits.innerText = "Total Hits: " + totalHits.toString();
	elements.displayScore.innerText = "Score: " + score.toFixed(2).toString() + " %";
});

// event listener for the compute visibility button
elements.clearLinesBtn.addEventListener("click", () => {
	clearLines();
});

// event listener for the compute shadow map button
elements.shadowMapBtn.addEventListener("click", () => {
	clearLines();
	let arr1D = computeShadowMap(light, true);
	let arr2D = convertArray1Dto2D(arr1D, 20);
	updateHeatmap(arr2D);
});

// event listener for the compute changes button
elements.changesMapBtn.addEventListener("click", () => {
	clearLines();
	let resoulution = parseInt(elements.resoulutioninput.value);
	let changeMap = computeChanges(resoulution);
	let shadowVariations = computeShadowVariatons(changeMap);
	let arr2D = convertArray1Dto2D(shadowVariations, 20);
	updateHeatmap(arr2D);
});
// event listener for the find pattern button
elements.findPatternBtn.addEventListener("click", () => {
	createPatternMap();
});
// event listener for the find pattern variation button
elements.findPatternVariationBtn.addEventListener("click", () => {
	createPatternMap(true);
});

// event listener for the sky visibility button
elements.skyVisibility.addEventListener("click", () => {
	console.log("Sky Visibility");
	let score = computeSkyVisability();
	elements.skyScore.innerText = "Score: " + score.toString() + " %";
	console.log(score);
});

// event listener for the select sky button
elements.selectSky.addEventListener("click", () => {
	console.log("Select Sky Point");
	skySelectionActive = true;
});

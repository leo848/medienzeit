let data;
let rot = 0;
let vel = 0;
let acc = 0;
let diam = 500;

let storage = window.localStorage;

let fApp = eval(storage.getItem(new Date().toDateString())) || undefined;
let ran = Boolean(fApp);
let colors = [];

let imgz = {};

function preload (){
	data = loadJSON('apps.json', (json) => {
		for (let i = 0; i < json.length; i++) {
			imgz[json[i][3]] = loadImage(json[i][3]);
		}
		data = json;
	});
}

function setup (){
	data = Object.values(data);
	data = data
		.map((elem) => {
			return [
				elem[0],
				elem[1] /
					data.reduce((e1, e2) => [ '', e1[1] + e2[1] ])[1] *
					360,
				elem[2],
				elem[3],
			];
		})
		.sort((a, b) => a - b);

	for (let i = 0; i < data.length; i++) {
		colors.push([ random(255), random(255), random(255) ]);
	}

	createCanvas(windowWidth, windowHeight);

	vel = 0;
	let iinter = setInterval(() => {
		if (vel < 10) {
			vel += 0.2;
		} else {
			clearInterval(iinter);
		}
	}, 50);

	textSize(17);
	noStroke();
}

function mousePressed (){
	if (!acc && vel >= 10) {
		acc = 0.05 + 0.01 * random();
	}
}

function draw (){
	background(255, 120);
	push();
	text([ rot, vel, acc ], 20, 20);
	translate(width / 2, height / 2);
	rotate(radians(rot));
	pieChart(diam, data);
	pop();
	fill('black');
	triangle(
		width / 2 + diam / 2 - 5,
		height / 2,
		width / 2 + diam / 2 + 20,
		height / 2 - 15,
		width / 2 + diam / 2 + 20,
		height / 2 + 15,
	);

	rot += Math.sqrt(vel * 10) || 0;

	if (vel >= 0) {
		acc *= 0.9955; //72;
		vel -= acc;
	} else {
		vel = 0;
		acc = 0;
		if (!ran) {
			fApp = determineResult();
			storage.setItem(new Date().toDateString(), JSON.stringify(fApp));
		}
	}
	if (ran) {
		push();
		rectMode(CENTER);
		imageMode(CENTER);
		noStroke();
		fill(255, 200);
		image(
			imgz[fApp[1]],
			width / 2,
			height / 2 - 30,
			height * 1.9048,
			height,
		);
		textSize(77);
		textAlign(CENTER, CENTER);
		fill('black');

		text(fApp[0], width / 2, height - 50);
		document.getElementById('title').innerText = fApp[0];

		let msg = new SpeechSynthesisUtterance();
		msg.text = fApp[0];
		window.speechSynthesis.speak(msg);
		pop();

		noLoop();
	}
}

function determineResult (){
	ran = true;

	rot %= 360;
	let rrot = (-rot + 360) % 360;
	let ssum = 0;
	for (let i = 0; i < data.length; i++) {
		ssum += data[i][1];
		if (rrot < ssum) {
			return [ data[i][0], data[i][3] ];
		}
	}
}

function pieChart (diameter, data){
	let lastAngle = 0;
	for (let i = 0; i < data.length; i++) {
		fill(data[i][2]);
		arc(
			0,
			0,
			diameter,
			diameter,
			lastAngle,
			lastAngle + radians(data[i][1]),
		);
		lastAngle += radians(data[i][1]);
	}
	lastAngle = 0;
	for (let i = 0; i < data.length; i++) {
		push();
		rotate(lastAngle + radians(data[i][1] / 2 + 3));
		translate(110, 0);
		fill('black');
		text(data[i][0], 0, 0);
		lastAngle += radians(data[i][1]);
		pop();
	}
}

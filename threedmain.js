import * as THREE from "https://cdn.jsdelivr.net/gh/nlimbasiya24/threeD/three.module.min.js";
import { TTFLoader } from "https://cdn.jsdelivr.net/gh/nlimbasiya24/threeD/TTFLoader.min.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/gh/nlimbasiya24/threeD/OrbitControls.min.js";
import { FlakesTexture } from "https://cdn.jsdelivr.net/gh/nlimbasiya24/threeD/FlakesTexture.min.js";
import { RGBELoader } from "https://cdn.jsdelivr.net/gh/nlimbasiya24/threeD/RGBELoader.min.js";

jQuery("#three-d-prv").click(function () {
  console.log("button clicked");
  jQuery("#prs-colors").html(three_d_swatches);

  if (jQuery("#personalized-preview").hasClass("prv-initialized")) {
    jQuery("#personalized-preview").fadeIn();
    setTimeout(function () {
      if ($("#infiniteoptions-container").find("input[type=text]").length) {
        if (
          $("#infiniteoptions-container").find("input[type=text]").val() != ""
        )
          text = $("#infiniteoptions-container").find("input[type=text]").val();
        refreshText();
      }
    }, 1000);
  } else {
    jQuery("#personalized-preview").fadeIn(function () {
      init();
      setTimeout(function () {
        if ($("#infiniteoptions-container").find("input[type=text]").length) {
          if (
            $("#infiniteoptions-container").find("input[type=text]").val() != ""
          )
            text = $("#infiniteoptions-container")
              .find("input[type=text]")
              .val();
          refreshText();
        }
      }, 1000);
    });
  }
});

let scene, camera, renderer, controls, pointlight;

let container, fontURL;
let cameraTarget;
let group,
  textMesh1,
  textMesh2,
  textGeo,
  material,
  ballMaterial,
  envmap,
  texture;
let firstLetter = true;

let text = "3D Preview";
let three_d_settings = window._3dSettings;
if (three_d_settings.defaultText != "") {
  text = three_d_settings.defaultText;
}

if (_3dSettings.transformation.includes("uppercase")) {
  text = text.toUpperCase();
} else if (_3dSettings.transformation.includes("lowercase")) {
  text = text.toLowerCase();
} else if (_3dSettings.transformation.includes("capitalize")) {
  text = text.toLowerCase();
  text = text.charAt(0).toUpperCase() + text.slice(1);
}

let three_d_swatches = "";
if (three_d_settings.colors.length) {
  three_d_settings.colors.forEach(function (item, index) {
    if (index == 0) {
      three_d_swatches +=
        '<li class="active" data-color="' +
        item +
        '" style="background: ' +
        item +
        '"></li>';
    } else {
      three_d_swatches +=
        '<li data-color="' + item + '" style="background: ' + item + '"></li>';
    }
  });
} else {
  let three_d_swatches =
    '<li class="active" data-color="' +
    item +
    '" style="background: ' +
    item +
    '"></li>';
}
console.log(three_d_swatches);

const height = 20,
  size = 70,
  hover = 0,
  curveSegments = 12,
  bevelThickness = 2,
  bevelSize = 1.5;

let font = null;
const mirror = false;

let targetRotation = 0;
let targetRotationOnPointerDown = 0;

let pointerX = 0;
let pointerXOnPointerDown = 0;

let windowHalfX = window.innerWidth / 2;

jQuery("#prs-close").click(function () {
  jQuery("#personalized-preview").fadeOut();
  jQuery("#junaid-prs-canvas").remove();
  jQuery("#personalized-preview").removeClass("prv-initialized");
});

function init() {
  scene = new THREE.Scene();

  container = document.createElement("div");
  container.setAttribute("id", "junaid-prs-canvas");
  jQuery("#personalized-preview").append(container);
  jQuery("#personalized-preview").addClass("prv-initialized");

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize($(container).width(), $(container).height());
  container.appendChild(renderer.domElement);

  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  camera = new THREE.PerspectiveCamera(
    70,
    $(container).width() / $(container).height(),
    1,
    1000
  );
  camera.position.set(0, 150, 500);
  controls = new OrbitControls(camera, renderer.domElement);

  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.enableDamping = true;

  pointlight = new THREE.PointLight(0xdab854, 1);
  pointlight.position.set(200, 200, 200);
  scene.add(pointlight);

  let envmaploader = new THREE.PMREMGenerator(renderer);

  new RGBELoader().load(
    three_d_settings.images.reflectiveImage.current.fileUrl,
    function (hdrmap) {
      envmap = envmaploader.fromCubemap(hdrmap);
      texture = new THREE.CanvasTexture(new FlakesTexture());
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.x = 10;
      texture.repeat.y = 6;

      group = new THREE.Group();
      scene.add(group);

      const loader = new TTFLoader();
      var jdFontURL = three_d_settings.selectedFont[0].fileUrl;
      loader.load(jdFontURL, function (json) {
        font = new THREE.Font(json);
        createText();
      });
      animate();
    }
  );

  // EVENTS

  container.style.touchAction = "none";
  container.addEventListener("pointerdown", onPointerDown);

  //document.addEventListener('keypress', onDocumentKeyPress);
  //document.addEventListener('keydown', onDocumentKeyDown);

  window.addEventListener("resize", onWindowResize);

  jQuery("#prs-colors li").click(function () {
    jQuery("#prs-colors li").removeClass("active");
    jQuery(this).addClass("active");
    refreshText(jQuery(this).attr("data-color"));
  });

  jQuery("#prv-update").click(function () {
    let updatedText = jQuery("#prs-text-input").val();
    if (updatedText != "") {
      if (_3dSettings.transformation.includes("uppercase")) {
        updatedText = updatedText.toUpperCase();
      } else if (_3dSettings.transformation.includes("lowercase")) {
        updatedText = updatedText.toLowerCase();
      } else if (_3dSettings.transformation.includes("capitalize")) {
        updatedText = updatedText.toLowerCase();
        updatedText =
          updatedText.charAt(0).toUpperCase() + updatedText.slice(1);
      }
      text = updatedText;
      refreshText();
    }
  });
}

function createText(textColor) {
  if (typeof textColor === "undefined") {
    textColor = jQuery("#prs-colors li.active").attr("data-color");
  }

  ballMaterial = {
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
    metalness: 1,
    roughness: 0.2,
    color: textColor,
    normalMap: texture,
    normalScale: new THREE.Vector2(0.15, 0.15),
    envMap: envmap.texture,
  };

  material = new THREE.MeshPhysicalMaterial(ballMaterial);

  textGeo = new THREE.TextGeometry(text, {
    font: font,

    size: size,
    height: height,
    curveSegments: curveSegments,

    bevelThickness: bevelThickness,
    bevelSize: bevelSize,
    bevelEnabled: true,
  });

  textGeo.computeBoundingBox();
  textGeo.computeVertexNormals();

  const centerOffset =
    -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

  textMesh1 = new THREE.Mesh(textGeo, material);

  textMesh1.position.x = centerOffset;
  textMesh1.position.y = hover;
  textMesh1.position.z = 0;

  textMesh1.rotation.x = 0;
  textMesh1.rotation.y = Math.PI * 2;

  group.add(textMesh1);

  if (mirror) {
    textMesh2 = new THREE.Mesh(textGeo, material);

    textMesh2.position.x = centerOffset;
    textMesh2.position.y = -hover;
    textMesh2.position.z = height;

    textMesh2.rotation.x = Math.PI;
    textMesh2.rotation.y = Math.PI * 2;

    group.add(textMesh2);
  }
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function onWindowResize() {
  windowHalfX = $(container).width() / 2;

  camera.aspect = $(container).width() / $(container).height();
  camera.updateProjectionMatrix();

  renderer.setSize($(container).width(), $(container).height());
}

function onDocumentKeyDown(event) {
  if (firstLetter) {
    firstLetter = false;
    text = "";
  }

  const keyCode = event.keyCode;

  // backspace

  if (keyCode === 8) {
    event.preventDefault();

    text = text.substring(0, text.length - 1);
    refreshText();

    return false;
  } else {
    const ch = String.fromCharCode(keyCode);
    text += ch;

    refreshText();
  }
}

function onDocumentKeyPress(event) {
  const keyCode = event.which;

  // backspace

  if (keyCode === 8) {
    event.preventDefault();
  } else {
    const ch = String.fromCharCode(keyCode);
    text += ch;

    refreshText();
  }
}

function refreshText(textColor) {
  try {
    group.remove(textMesh1);
  } catch (err) {
    console.log(err);
  }
  if (mirror) group.remove(textMesh2);

  if (!text) return;

  createText(textColor);
}

function onPointerDown(event) {
  if (event.isPrimary === false) return;

  pointerXOnPointerDown = event.clientX - windowHalfX;
  targetRotationOnPointerDown = targetRotation;

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(event) {
  if (event.isPrimary === false) return;

  pointerX = event.clientX - windowHalfX;

  targetRotation =
    targetRotationOnPointerDown + (pointerX - pointerXOnPointerDown) * 0.02;
}

function onPointerUp() {
  if (event.isPrimary === false) return;

  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);
}

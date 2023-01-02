import * as e from "https://cdn.jsdelivr.net/gh/nlimbasiya24/threeD/three.module.min.js";
import { TTFLoader as t } from "https://cdn.jsdelivr.net/gh/nlimbasiya24/threeD/TTFLoader.min.js";
import { OrbitControls as n } from "https://cdn.jsdelivr.net/gh/nlimbasiya24/threeD/OrbitControls.min.js";
import { FlakesTexture as i } from "https://cdn.jsdelivr.net/gh/nlimbasiya24/threeD/FlakesTexture.min.js";
import { RGBELoader as r } from "https://cdn.jsdelivr.net/gh/nlimbasiya24/threeD/RGBELoader.min.js";
jQuery("#three-d-prv").click(function () {
  console.log("button clicked"),
    jQuery("#prs-colors").html(three_d_swatches),
    jQuery("#personalized-preview").hasClass("prv-initialized")
      ? (jQuery("#personalized-preview").fadeIn(),
        setTimeout(function () {
          $("#infiniteoptions-container").find("input[type=text]").length &&
            ("" !=
              $("#infiniteoptions-container").find("input[type=text]").val() &&
              (text = $("#infiniteoptions-container")
                .find("input[type=text]")
                .val()),
            refreshText());
        }, 1e3))
      : jQuery("#personalized-preview").fadeIn(function () {
          init(),
            setTimeout(function () {
              $("#infiniteoptions-container").find("input[type=text]").length &&
                ("" !=
                  $("#infiniteoptions-container")
                    .find("input[type=text]")
                    .val() &&
                  (text = $("#infiniteoptions-container")
                    .find("input[type=text]")
                    .val()),
                refreshText());
            }, 1e3);
        });
});
let scene,
  camera,
  renderer,
  controls,
  pointlight,
  container,
  fontURL,
  cameraTarget,
  group,
  textMesh1,
  textMesh2,
  textGeo,
  material,
  ballMaterial,
  envmap,
  texture,
  firstLetter = !0,
  text = "3D Preview",
  three_d_settings = window._3dSettings;
"" != three_d_settings.defaultText && (text = three_d_settings.defaultText),
  _3dSettings.transformation.includes("uppercase")
    ? (text = text.toUpperCase())
    : _3dSettings.transformation.includes("lowercase")
    ? (text = text.toLowerCase())
    : _3dSettings.transformation.includes("capitalize") &&
      (text =
        (text = text.toLowerCase()).charAt(0).toUpperCase() + text.slice(1));
let three_d_swatches = "";
three_d_settings.colors.length &&
  three_d_settings.colors.forEach(function (e, t) {
    0 == t
      ? (three_d_swatches +=
          '<li class="active" data-color="' +
          e +
          '" style="background: ' +
          e +
          '"></li>')
      : (three_d_swatches +=
          '<li data-color="' + e + '" style="background: ' + e + '"></li>');
  }),
  console.log(three_d_swatches);
let height = 20,
  size = 70,
  hover = 0,
  curveSegments = 12,
  bevelThickness = 2,
  bevelSize = 1.5,
  font = null,
  mirror = !1,
  targetRotation = 0,
  targetRotationOnPointerDown = 0,
  pointerX = 0,
  pointerXOnPointerDown = 0,
  windowHalfX = window.innerWidth / 2;
function init() {
  (scene = new e.Scene()),
    (container = document.createElement("div")).setAttribute(
      "id",
      "junaid-prs-canvas"
    ),
    jQuery("#personalized-preview").append(container),
    jQuery("#personalized-preview").addClass("prv-initialized"),
    (renderer = new e.WebGLRenderer({ alpha: !0, antialias: !0 })).setSize(
      $(container).width(),
      $(container).height()
    ),
    container.appendChild(renderer.domElement),
    (renderer.outputEncoding = e.sRGBEncoding),
    (renderer.toneMapping = e.ACESFilmicToneMapping),
    (renderer.toneMappingExposure = 1.25),
    (camera = new e.PerspectiveCamera(
      70,
      $(container).width() / $(container).height(),
      1,
      1e3
    )).position.set(0, 150, 500),
    ((controls = new n(camera, renderer.domElement)).autoRotate = !0),
    (controls.autoRotateSpeed = 0.5),
    (controls.enableDamping = !0),
    (pointlight = new e.PointLight(14334036, 1)).position.set(200, 200, 200),
    scene.add(pointlight);
  let o = new e.PMREMGenerator(renderer);
  new r().load(
    three_d_settings.images.reflectiveImage.current.fileUrl,
    function (n) {
      (envmap = o.fromCubemap(n)),
        ((texture = new e.CanvasTexture(new i())).wrapS = e.RepeatWrapping),
        (texture.wrapT = e.RepeatWrapping),
        (texture.repeat.x = 10),
        (texture.repeat.y = 6),
        (group = new e.Group()),
        scene.add(group);
      let r = new t();
      var a = selectedFont[0].fileUrl;
      r.load(a, function (t) {
        (font = new e.Font(t)), createText();
      }),
        animate();
    }
  ),
    (container.style.touchAction = "none"),
    container.addEventListener("pointerdown", onPointerDown),
    window.addEventListener("resize", onWindowResize),
    jQuery("#prs-colors li").click(function () {
      jQuery("#prs-colors li").removeClass("active"),
        jQuery(this).addClass("active"),
        refreshText(jQuery(this).attr("data-color"));
    }),
    jQuery("#prv-update").click(function () {
      let e = jQuery("#prs-text-input").val();
      "" != e &&
        (_3dSettings.transformation.includes("uppercase")
          ? (e = e.toUpperCase())
          : _3dSettings.transformation.includes("lowercase")
          ? (e = e.toLowerCase())
          : _3dSettings.transformation.includes("capitalize") &&
            (e = (e = e.toLowerCase()).charAt(0).toUpperCase() + e.slice(1)),
        (text = e),
        refreshText());
    });
}
function createText(t) {
  void 0 === t && (t = jQuery("#prs-colors li.active").attr("data-color")),
    (ballMaterial = {
      clearcoat: 1,
      clearcoatRoughness: 0.01,
      metalness: 1,
      roughness: 0.2,
      color: t,
      normalMap: texture,
      normalScale: new e.Vector2(0.15, 0.15),
      envMap: envmap.texture,
    }),
    (material = new e.MeshPhysicalMaterial(ballMaterial)),
    (textGeo = new e.TextGeometry(text, {
      font: font,
      size: 70,
      height: 20,
      curveSegments: 12,
      bevelThickness: 2,
      bevelSize: 1.5,
      bevelEnabled: !0,
    })).computeBoundingBox(),
    textGeo.computeVertexNormals();
  let n = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
  ((textMesh1 = new e.Mesh(textGeo, material)).position.x = n),
    (textMesh1.position.y = 0),
    (textMesh1.position.z = 0),
    (textMesh1.rotation.x = 0),
    (textMesh1.rotation.y = 2 * Math.PI),
    group.add(textMesh1);
}
function animate() {
  controls.update(),
    renderer.render(scene, camera),
    requestAnimationFrame(animate);
}
function onWindowResize() {
  (windowHalfX = $(container).width() / 2),
    (camera.aspect = $(container).width() / $(container).height()),
    camera.updateProjectionMatrix(),
    renderer.setSize($(container).width(), $(container).height());
}
function onDocumentKeyDown(e) {
  firstLetter && ((firstLetter = !1), (text = ""));
  let t = e.keyCode;
  if (8 === t)
    return (
      e.preventDefault(),
      (text = text.substring(0, text.length - 1)),
      refreshText(),
      !1
    );
  {
    let n = String.fromCharCode(t);
    (text += n), refreshText();
  }
}
function onDocumentKeyPress(e) {
  let t = e.which;
  if (8 === t) e.preventDefault();
  else {
    let n = String.fromCharCode(t);
    (text += n), refreshText();
  }
}
function refreshText(e) {
  try {
    group.remove(textMesh1);
  } catch (t) {
    console.log(t);
  }
  text && createText(e);
}
function onPointerDown(e) {
  !1 !== e.isPrimary &&
    ((pointerXOnPointerDown = e.clientX - windowHalfX),
    (targetRotationOnPointerDown = targetRotation),
    document.addEventListener("pointermove", onPointerMove),
    document.addEventListener("pointerup", onPointerUp));
}
function onPointerMove(e) {
  !1 !== e.isPrimary &&
    (targetRotation =
      targetRotationOnPointerDown +
      ((pointerX = e.clientX - windowHalfX) - pointerXOnPointerDown) * 0.02);
}
function onPointerUp() {
  !1 !== event.isPrimary &&
    (document.removeEventListener("pointermove", onPointerMove),
    document.removeEventListener("pointerup", onPointerUp));
}
jQuery("#prs-close").click(function () {
  jQuery("#personalized-preview").fadeOut(),
    jQuery("#junaid-prs-canvas").remove(),
    jQuery("#personalized-preview").removeClass("prv-initialized");
});
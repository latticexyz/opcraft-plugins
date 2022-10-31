import { render } from "preact";
import { useEffect } from "preact/hooks";
import { Textures } from "./OPCraftTextureNames";

const ID = "autumn-plugin-root";

const noa = window.layers.noa.noa;

// Create React UI
const Container = () => {
  const textureNameToUrl = {
    // These don't work somehow
    [Textures.RedFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.OrangeFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.MagentaFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.MagentaFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.LightBlueFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.LimeFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.PinkFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.GrayFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.LightGrayFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.CyanFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.PurpleFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.BlueFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.GreenFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.BlackFlower]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.Kelp]: 'https://i.imgur.com/sW4X9yI.png',
    // Textures that actually change
    // [Textures.Grass]: 'https://i.imgur.com/sW4X9yI.png',
    // Red leaves
    // [Textures.Leaves]: 'https://i.imgur.com/zhdz4ER.png',
    // Yellow leaves
    [Textures.Leaves]: 'https://i.imgur.com/f7oIj6y.png',
    [Textures.Diamond]: 'https://i.imgur.com/iGCwvsO.png',
    // [Textures.Bedrock]: 'https://i.imgur.com/sW4X9yI.png',
    // [Textures.Bricks]: 'https://i.imgur.com/sW4X9yI.png',
    // [Textures.Glass]: 'https://i.imgur.com/sW4X9yI.png',
    // [Textures.Sand]: 'https://i.imgur.com/sW4X9yI.png',
    // [Textures.Dirt]: 'https://i.imgur.com/sW4X9yI.png',
    // [Textures.Stone]: 'https://i.imgur.com/sW4X9yI.png',
    // [Textures.Water]: 'https://i.imgur.com/sW4X9yI.png',
    // [Textures.Cobblestone]: 'https://i.imgur.com/sW4X9yI.png',
    // [Textures.Stone]: 'https://i.imgur.com/sW4X9yI.png',
    [Textures.Grass]: 'https://i.imgur.com/sySjgl0.png',
    [Textures.GrassSide]: 'https://i.imgur.com/s7YumQ2.png',
    [Textures.GrassBottom]: 'https://i.imgur.com/taBBKX4.png',
    // Orange grass
    // [Textures.Grass]: 'https://i.imgur.com/imUAW4F.png',
  }
  useEffect(() => {
    Object.entries(textureNameToUrl).forEach(
      ([textureName, url]) => {
        noa.registry.registerMaterial(textureName, undefined, url, true)
      }
    )
  }, []);

  return null;
};


// Cleanup function to call when plugin gets reloaded
function cleanup() {
  document.getElementById(ID)?.remove();
}

// Create a new react root to mount this element
cleanup();
const root = document.createElement("div");
root.id = ID;
document.body.appendChild(root);
render(<Container />, root);

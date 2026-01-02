import Phaser from "phaser"

interface Cel {
    metadata: Record<string, unknown>;
    opacity: number;
    ui_color: string;
    z_index: number;
}

interface Frame {
    cels: Cel[];
    duration: number;
    metadata: Record<string, unknown>;
}

interface Layer {
    blend_mode: number;
    clipping_mask: boolean;
    effects: any[]; // Adjust type if more detailed structure is known
    locked: boolean;
    metadata: Record<string, unknown>;
    name: string;
    new_cels_linked: boolean;
    opacity: number;
    parent: number;
    type: number;
    ui_color: string;
    visible: boolean;
}

interface Tag {
    color: string;
    from: number;
    name: string;
    to: number;
}

interface PaintConfig {
    brushes: any[]; // Adjust type if more detailed structure is known
    color_mode: number;
    current_frame: number;
    current_layer: number;
    export_file_format: number;
    export_file_name: string;
    fps: number;
    frames: Frame[];
    guides: any[]; // Adjust type if guides have a specific structure
    layers: Layer[];
    metadata: Record<string, unknown>;
    palettes: any[]; // Adjust type if palettes have a specific structure
    pixelorama_version: string;
    project_current_palette_name: string;
    pxo_version: number;
    reference_images: any[]; // Adjust type if reference images have a specific structure
    size_x: number;
    size_y: number;
    symmetry_points: number[];
    tags: Tag[];
    tile_mode_x_basis_x: number;
    tile_mode_x_basis_y: number;
    tile_mode_y_basis_x: number;
    tile_mode_y_basis_y: number;
    tilesets: any[]; // Adjust type if tilesets have a specific structure
    user_data: string;
    vanishing_points: any[]; // Adjust type if vanishing points have a specific structure
}



/**
 * 
 * remember to export from Pixelorama using Spritesheet in **Row** orientation.
 * 
 * 
 */
export function generateFramesFromPixeloramaData(key: string, tag: string, data: PaintConfig): Phaser.Types.Animations.AnimationFrame[] | undefined {
    const out: Phaser.Types.Animations.AnimationFrame[] = [];

    // console.log(`generateFramesFromPixeloramaData with key=${key} tag=${tag}`);
    // Find the specified tag from the data
    const relevantTag = data.tags.find(t => t.name === tag);

    // Check if the relevant tag exists
    if (!relevantTag) {
        console.warn(`Tag "${tag}" not found in Pixelorama data`);
        return;
    }

    // Access the tag's range
    const from = relevantTag.from;
    const to = relevantTag.to;

    // Loop through the range from 'from' to 'to' and push frames directly
    for (let frame = from - 1; frame <= to - 1; frame++) {
        out.push({ key, frame });
    }

    // console.log('out:', out);
    return out;
}





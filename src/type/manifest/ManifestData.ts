import Shortcut from '../shortcut/Shortcut.js'

interface ManifestData {
    name: string,
    rootDirectory: string,
    outputPath: string,
    shortcuts: Shortcut[]
}

export default ManifestData;
$PackageVersion = $args[0]

$OutputPath = "./Builds/CCL-$($PackageVersion)/CCL.vsix"
mkdir ./Builds/CCL-$PackageVersion

vsce pack -o $OutputPath
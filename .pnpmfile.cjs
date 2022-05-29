function readPackage(pkg) {
  // Filter dependencies in app templates that are present in the root package.json.
  // This allows us to provide complete package.json files for all app templates.
  if (/-app$/.test(pkg.name)) {
    pkg.dependencies = omitRootDependencies(pkg.name, pkg.dependencies);
    pkg.devDependencies = omitRootDependencies(pkg.name, pkg.devDependencies);
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};

function omitRootDependencies(packageName, dependencies) {
  const packageJson = require('./package.json');
  const rootDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const filteredDependencies = {};
  const allowedDuplicatePackages = [
    // We're on an older version of eslint due to eslint-config-rainbow
    // so we need to allow multiple versions for now.
    'eslint',
  ];

  Object.keys(dependencies).forEach(dep => {
    if (!rootDependencies[dep] || allowedDuplicatePackages.includes(dep)) {
      filteredDependencies[dep] = dependencies[dep];
    } else if (rootDependencies[dep] !== dependencies[dep]) {
      throw new Error(
        [
          `Dependency ${dep} has different version in root package.json. Root: ${rootDependencies[dep]}, ${packageName}: ${dependencies[dep]}`,
          packageName === 'test-app' &&
            'You might have stale files left over from a past create-rainbowkit run. Try running "pnpm clean".',
        ]
          .filter(Boolean)
          .join('\n')
      );
    }
  });

  return filteredDependencies;
}

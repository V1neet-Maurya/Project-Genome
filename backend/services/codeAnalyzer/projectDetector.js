import fs from "fs";
import path from "path";

const exists = (
  directory,
  file
) => {
  return fs.existsSync(
    path.join(directory, file)
  );
};

export const detectProject = (
  directory
) => {
  const result = {
    languages: [],
    frameworks: [],
    type: "Unknown",
  };

  if (
    exists(
      directory,
      "package.json"
    )
  ) {
    result.languages.push(
      "JavaScript"
    );

    result.type =
      "JavaScript";

    try {
      const packageJson =
        JSON.parse(
          fs.readFileSync(
            path.join(
              directory,
              "package.json"
            ),
            "utf-8"
          )
        );

      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (dependencies.react) {
        result.frameworks.push(
          "React"
        );
      }

      if (dependencies.express) {
        result.frameworks.push(
          "Express"
        );
      }

      if (dependencies.next) {
        result.frameworks.push(
          "Next.js"
        );
      }

      if (dependencies.vue) {
        result.frameworks.push(
          "Vue"
        );
      }
    } catch (error) {
      console.error(
        "package.json parsing failed:",
        error.message
      );
    }
  }

  if (
    exists(
      directory,
      "requirements.txt"
    )
  ) {
    result.languages.push(
      "Python"
    );

    result.type = "Python";
  }

  if (
    exists(
      directory,
      "pom.xml"
    )
  ) {
    result.languages.push(
      "Java"
    );

    result.type = "Java";
  }

  if (
    exists(
      directory,
      "go.mod"
    )
  ) {
    result.languages.push(
      "Go"
    );

    result.type = "Go";
  }

  return result;
};
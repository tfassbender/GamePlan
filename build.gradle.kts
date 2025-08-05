plugins {
    id("java")
    id("io.quarkus") version "3.8.1"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(enforcedPlatform("io.quarkus:quarkus-bom:3.8.1"))
    implementation("io.quarkus:quarkus-resteasy-reactive")
    implementation("io.quarkus:quarkus-resteasy-reactive-jackson")
    implementation("jakarta.ws.rs:jakarta.ws.rs-api:3.1.0")
    implementation("com.vladsch.flexmark:flexmark-all:0.64.0") // markdown to html transformation

    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

tasks.register("buildFrontend") {
    group = "build"
    description = "Builds the React frontend and copies the output to Quarkus resources."
    doLast {
        exec {
            workingDir = file("frontend")
            commandLine = if (System.getProperty("os.name").lowercase().contains("win")) {
                listOf("cmd", "/c", "npm run build")
            } else {
                listOf("npm", "run", "build")
            }
        }
        val buildDir = file("frontend/build")
        val resourcesDir = file("src/main/resources/META-INF/resources")
        if (buildDir.exists()) {
            buildDir.walkTopDown().forEach { file ->
                if (file.isFile) {
                    val target = File(resourcesDir, file.relativeTo(buildDir).path)
                    target.parentFile.mkdirs()
                    file.copyTo(target, overwrite = true)
                }
            }
        }
    }
}

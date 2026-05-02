// EMPIRE ONE MASTER SHADER: SOVEREIGN PBR
// FOCUS: METALLIC REFLECTION & SODIUM VAPOR GLOW

precision highp float;
varying vec2 v_texCoord;
uniform sampler2D u_albedo;    // The Midjourney Base Art
uniform sampler2D u_normalMap; // Generated Depth Data
uniform vec3 u_lightPos;       // Position of the Streetlight
uniform vec3 u_lightColor;     // Sodium Vapor Orange [1.0, 0.55, 0.0]

void main() {
    // 1. Extract Material Data
    vec4 texColor = texture2D(u_albedo, v_texCoord);
    vec3 normal = normalize(texture2D(u_normalMap, v_texCoord).rgb * 2.0 - 1.0);
    
    // 2. Calculate Lighting (The SGV Cruise Vibe)
    vec3 lightDir = normalize(u_lightPos);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * u_lightColor;
    
    // 3. The Chrome Shine (Specular)
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);
    vec3 specular = spec * vec3(1.0, 1.0, 1.0); 

    // 4. Final Output with Noir Contrast
    vec3 finalColor = (diffuse + 0.15 + specular) * texColor.rgb;
    gl_FragColor = vec4(finalColor, texColor.a);
}

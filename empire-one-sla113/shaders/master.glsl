// EMPIRE ONE MASTER SHADER
precision highp float;
uniform sampler2D u_albedo;    // Midjourney Art
uniform sampler2D u_normalMap; // Depth Data
uniform vec3 u_lightColor;     // Sodium Vapor Orange

void main() {
    vec3 base = texture2D(u_albedo, v_texCoord).rgb;
    vec3 normal = normalize(texture2D(u_normalMap, v_texCoord).rgb * 2.0 - 1.0);
    float shine = pow(max(dot(normal, vec3(0,0,1)), 0.0), 64.0);
    gl_FragColor = vec4(base * u_lightColor + shine, 1.0);
}

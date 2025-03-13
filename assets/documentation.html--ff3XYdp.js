import{_ as s,e as a,f as e,o as i}from"./app-CokRI-YJ.js";const t={};function l(p,n){return i(),a("div",null,n[0]||(n[0]=[e(`<h1 id="documentation-guidelines" tabindex="-1"><a class="header-anchor" href="#documentation-guidelines"><span>Documentation Guidelines</span></a></h1><p>This guide outlines the documentation standards and practices for the Entix API project.</p><h2 id="documentation-types" tabindex="-1"><a class="header-anchor" href="#documentation-types"><span>Documentation Types</span></a></h2><p>The Entix API project includes several types of documentation:</p><ol><li><strong>Code Documentation</strong>: Comments and type definitions within the code</li><li><strong>API Documentation</strong>: Documentation of API endpoints and behaviors</li><li><strong>Development Documentation</strong>: Guidelines for developers working on the project</li><li><strong>User Documentation</strong>: Instructions for users of the API</li></ol><h2 id="code-documentation" tabindex="-1"><a class="header-anchor" href="#code-documentation"><span>Code Documentation</span></a></h2><h3 id="tsdoc-comments" tabindex="-1"><a class="header-anchor" href="#tsdoc-comments"><span>TSDoc Comments</span></a></h3><p>Use TSDoc comments for all public functions, methods, classes, and interfaces:</p><div class="language-typescript line-numbers-mode" data-highlighter="prismjs" data-ext="ts"><pre><code><span class="line"><span class="token comment">/**</span>
<span class="line"> * Represents a user in the system</span>
<span class="line"> */</span></span>
<span class="line"><span class="token keyword">type</span> <span class="token class-name">User</span> <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token comment">/**</span>
<span class="line">   * Unique identifier for the user</span>
<span class="line">   */</span></span>
<span class="line">  id<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">/**</span>
<span class="line">   * Username for authentication</span>
<span class="line">   * @minLength 3</span>
<span class="line">   * @maxLength 50</span>
<span class="line">   */</span></span>
<span class="line">  username<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">/**</span>
<span class="line">   * User&#39;s email address</span>
<span class="line">   * @format email</span>
<span class="line">   */</span></span>
<span class="line">  email<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">  <span class="token comment">/**</span>
<span class="line">   * When the user was created</span>
<span class="line">   */</span></span>
<span class="line">  createdAt<span class="token operator">:</span> Date<span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">/**</span>
<span class="line"> * Service for managing users</span>
<span class="line"> */</span></span>
<span class="line"><span class="token decorator"><span class="token at operator">@</span><span class="token function">Service</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line"><span class="token keyword">class</span> <span class="token class-name">UserService</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token comment">/**</span>
<span class="line">   * Finds a user by their ID</span>
<span class="line">   *</span>
<span class="line">   * @param id - The user&#39;s unique identifier</span>
<span class="line">   * @returns The user if found, undefined otherwise</span>
<span class="line">   * @throws DatabaseError if the database connection fails</span>
<span class="line">   */</span></span>
<span class="line">  <span class="token keyword">async</span> <span class="token function">findById</span><span class="token punctuation">(</span>id<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">Promise</span><span class="token operator">&lt;</span>User <span class="token operator">|</span> <span class="token keyword">undefined</span><span class="token operator">&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token comment">// Implementation</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="type-definitions" tabindex="-1"><a class="header-anchor" href="#type-definitions"><span>Type Definitions</span></a></h3><p>Use explicit type definitions to document the shape of data:</p><div class="language-typescript line-numbers-mode" data-highlighter="prismjs" data-ext="ts"><pre><code><span class="line"><span class="token comment">// Instead of:</span></span>
<span class="line"><span class="token keyword">function</span> <span class="token function">createUser</span><span class="token punctuation">(</span>userData<span class="token operator">:</span> <span class="token builtin">any</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">any</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token comment">// Implementation</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line"><span class="token comment">// Use:</span></span>
<span class="line"><span class="token keyword">type</span> <span class="token class-name">CreateUserDto</span> <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">  username<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line">  email<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line">  password<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">type</span> <span class="token class-name">UserResponse</span> <span class="token operator">=</span> <span class="token punctuation">{</span></span>
<span class="line">  id<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line">  username<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line">  email<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line">  createdAt<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span></span>
<span class="line"><span class="token punctuation">}</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line"><span class="token keyword">function</span> <span class="token function">createUser</span><span class="token punctuation">(</span>userData<span class="token operator">:</span> CreateUserDto<span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">Promise</span><span class="token operator">&lt;</span>UserResponse<span class="token operator">&gt;</span> <span class="token punctuation">{</span></span>
<span class="line">  <span class="token comment">// Implementation</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="api-documentation" tabindex="-1"><a class="header-anchor" href="#api-documentation"><span>API Documentation</span></a></h2><p>The API documentation is maintained in Markdown files in the <code>docs/api-reference</code> directory.</p><h3 id="endpoint-documentation" tabindex="-1"><a class="header-anchor" href="#endpoint-documentation"><span>Endpoint Documentation</span></a></h3><p>Each API endpoint should include:</p><ul><li>HTTP method and URL path</li><li>Description of what the endpoint does</li><li>Request parameters, body, and headers</li><li>Response structure and possible status codes</li><li>Example requests and responses</li><li>Authentication requirements</li></ul><p>Example:</p><div class="language-markdown line-numbers-mode" data-highlighter="prismjs" data-ext="md"><pre><code><span class="line"><span class="token title important"><span class="token punctuation">##</span> Get User</span></span>
<span class="line"></span>
<span class="line"><span class="token code-snippet code keyword">\`GET /users/:id\`</span></span>
<span class="line"></span>
<span class="line">Retrieves a user by their ID.</span>
<span class="line"></span>
<span class="line"><span class="token title important"><span class="token punctuation">###</span> Request Parameters</span></span>
<span class="line"></span>
<span class="line"><span class="token table"><span class="token table-header-row"><span class="token punctuation">|</span><span class="token table-header important"> Parameter </span><span class="token punctuation">|</span><span class="token table-header important"> Type   </span><span class="token punctuation">|</span><span class="token table-header important"> Description </span><span class="token punctuation">|</span></span>
<span class="line"></span><span class="token table-line"><span class="token punctuation">|</span> <span class="token punctuation">---------</span> <span class="token punctuation">|</span> <span class="token punctuation">------</span> <span class="token punctuation">|</span> <span class="token punctuation">-----------</span> <span class="token punctuation">|</span></span>
<span class="line"></span><span class="token table-data-rows"><span class="token punctuation">|</span><span class="token table-data"> id        </span><span class="token punctuation">|</span><span class="token table-data"> string </span><span class="token punctuation">|</span><span class="token table-data"> User ID     </span><span class="token punctuation">|</span></span>
<span class="line"></span></span></span>
<span class="line"><span class="token title important"><span class="token punctuation">###</span> Response</span></span>
<span class="line"></span>
<span class="line"><span class="token title important"><span class="token punctuation">####</span> 200 OK</span></span>
<span class="line"></span>
<span class="line"><span class="token code"><span class="token punctuation">\`\`\`</span><span class="token code-language">json</span></span>
<span class="line"><span class="token code-block language-json language-json"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token string">&quot;123&quot;</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token property">&quot;username&quot;</span><span class="token operator">:</span> <span class="token string">&quot;john_doe&quot;</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token property">&quot;email&quot;</span><span class="token operator">:</span> <span class="token string">&quot;john@example.com&quot;</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token property">&quot;createdAt&quot;</span><span class="token operator">:</span> <span class="token string">&quot;2023-01-01T00:00:00.000Z&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span></span>
<span class="line"><span class="token punctuation">\`\`\`</span></span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_404-not-found" tabindex="-1"><a class="header-anchor" href="#_404-not-found"><span>404 Not Found</span></a></h4><div class="language-json line-numbers-mode" data-highlighter="prismjs" data-ext="json"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">  <span class="token property">&quot;success&quot;</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span></span>
<span class="line">  <span class="token property">&quot;error&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;message&quot;</span><span class="token operator">:</span> <span class="token string">&quot;User not found&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;USER_NOT_FOUND&quot;</span></span>
<span class="line">  <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="authentication" tabindex="-1"><a class="header-anchor" href="#authentication"><span>Authentication</span></a></h3><p>Requires authentication: Yes</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line"></span>
<span class="line">## Development Documentation</span>
<span class="line"></span>
<span class="line">Development documentation should include:</span>
<span class="line"></span>
<span class="line">- Project setup instructions</span>
<span class="line">- Coding standards and best practices</span>
<span class="line">- Testing guidelines</span>
<span class="line">- Contribution guidelines</span>
<span class="line">- Architecture overview</span>
<span class="line">- Deployment procedures</span>
<span class="line"></span>
<span class="line">## VuePress Documentation</span>
<span class="line"></span>
<span class="line">The Entix API uses VuePress for generating comprehensive documentation.</span>
<span class="line"></span>
<span class="line">### Documentation Structure</span>
<span class="line"></span>
<span class="line">The documentation is organized as follows:</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>docs/ ├── .vuepress/ │ └── config.js ├── README.md (Introduction) ├── getting-started/ │ ├── installation.md │ ├── dev-container.md │ └── ... ├── core-concepts/ │ ├── project-structure.md │ └── ... ├── features/ │ ├── validation.md │ └── ... ├── api-reference/ │ ├── endpoints.md │ └── ... └── ...</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code><span class="line"></span>
<span class="line">### Writing Documentation</span>
<span class="line"></span>
<span class="line">When writing documentation:</span>
<span class="line"></span>
<span class="line">1. Use clear, concise language</span>
<span class="line">2. Include code examples when relevant</span>
<span class="line">3. Use headings to organize content</span>
<span class="line">4. Link to related documentation when appropriate</span>
<span class="line">5. Keep the documentation up to date with code changes</span>
<span class="line"></span>
<span class="line">### Running Documentation Locally</span>
<span class="line"></span>
<span class="line">To preview the documentation locally:</span>
<span class="line"></span>
<span class="line">\`\`\`bash</span>
<span class="line">npm run docs:dev</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>The documentation will be available at <code>http://localhost:8080</code>.</p><h3 id="building-documentation" tabindex="-1"><a class="header-anchor" href="#building-documentation"><span>Building Documentation</span></a></h3><p>To build the documentation for production:</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code><span class="line"><span class="token function">npm</span> run docs:build</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>The built documentation will be in the <code>.vuepress/dist</code> directory.</p><h2 id="documentation-updates" tabindex="-1"><a class="header-anchor" href="#documentation-updates"><span>Documentation Updates</span></a></h2><p>Documentation should be updated whenever:</p><ol><li>New features are added</li><li>Existing features are changed</li><li>API endpoints are added or modified</li><li>Dependencies are updated</li><li>Setup or configuration processes change</li></ol><h2 id="best-practices" tabindex="-1"><a class="header-anchor" href="#best-practices"><span>Best Practices</span></a></h2><ol><li><strong>Keep Documentation Close to Code</strong>: Document code features as close to the implementation as possible.</li><li><strong>Be Consistent</strong>: Follow a consistent style and format throughout the documentation.</li><li><strong>Use Examples</strong>: Include examples to illustrate how to use features.</li><li><strong>Consider the Audience</strong>: Write with the intended audience in mind (developers, users, etc.).</li><li><strong>Review Documentation</strong>: Review and update documentation regularly to ensure it stays accurate.</li><li><strong>Document Errors</strong>: Include information about possible errors and how to handle them.</li><li><strong>Use Diagrams</strong>: When appropriate, include diagrams to explain complex concepts or architectures.</li></ol>`,36)]))}const c=s(t,[["render",l],["__file","documentation.html.vue"]]),d=JSON.parse('{"path":"/development/documentation.html","title":"Documentation Guidelines","lang":"en-US","frontmatter":{"title":"Documentation Guidelines"},"headers":[{"level":2,"title":"Documentation Types","slug":"documentation-types","link":"#documentation-types","children":[]},{"level":2,"title":"Code Documentation","slug":"code-documentation","link":"#code-documentation","children":[{"level":3,"title":"TSDoc Comments","slug":"tsdoc-comments","link":"#tsdoc-comments","children":[]},{"level":3,"title":"Type Definitions","slug":"type-definitions","link":"#type-definitions","children":[]}]},{"level":2,"title":"API Documentation","slug":"api-documentation","link":"#api-documentation","children":[{"level":3,"title":"Endpoint Documentation","slug":"endpoint-documentation","link":"#endpoint-documentation","children":[]},{"level":3,"title":"Authentication","slug":"authentication","link":"#authentication","children":[]},{"level":3,"title":"Building Documentation","slug":"building-documentation","link":"#building-documentation","children":[]}]},{"level":2,"title":"Documentation Updates","slug":"documentation-updates","link":"#documentation-updates","children":[]},{"level":2,"title":"Best Practices","slug":"best-practices","link":"#best-practices","children":[]}],"git":{"updatedTime":1741830642000,"contributors":[{"name":"David Chen","username":"David Chen","email":"chen7daivd@me.com","commits":1,"url":"https://github.com/David Chen"}],"changelog":[{"hash":"1626b1bbc5257506beb3210733f80505feb15762","time":1741830642000,"email":"chen7daivd@me.com","author":"David Chen","message":"chore: added docs"}]},"filePathRelative":"development/documentation.md"}');export{c as comp,d as data};

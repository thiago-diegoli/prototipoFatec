async function carregaConteudo(){
    carregaHeader()
}

function carregaHeader(){
    header.innerHTML = `
    <nav class="bg-white fixed w-full z-20 top-0 left-0 border-b border-gray-200">
            <ul class="navigation max-w-[90vw] flex flex-wrap justify-between items-center relative mx-auto py-4">
                <a class="logo flex items-center" href="index.html">
                    <img src="img/fatec-votorantim.png" alt="Logo Fatec" class="h-16 mr-16">
                    <img src="img/cps.png" alt="Logo CPS" class="h-16">
                </a>
            </ul>
        </nav>`
}

function carregaCentro(){
    
    centro.innerHTML = `
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto mt-24">
    <div class="w-full bg-white rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            ${form}
        </div>
    </div>
</div>
        `
}


form = 
`<h1 class="text-lg font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
    Por favor, faça seu login.
</h1>
<form class="space-y-4 md:space-y-6" id="formLogin">
    <div>
        <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
        <input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="usuario@email.com">
    </div>
    <div>
        <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Senha</label>
        <input type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
    </div>
    <div class="flex items-center justify-between">
        <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-500">
            </div>
            <div class="ml-3 text-sm">
              <label for="remember" class="text-gray-500">Lembrar login</label>
            </div>
        </div>
        <a href="#" class="text-sm font-medium text-blue-500 hover:underline">Esqueceu sua senha?</a>
    </div>
    <button type="submit" class="w-full text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Fazer login</button>
    <p class="text-sm font-light text-gray-500">
        Não possui conta ainda? <a href="cadastro_login.html" class="font-medium text-blue-500 hover:underline">Cadastre-se</a>
    </p>
</form>`
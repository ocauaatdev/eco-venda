module.exports = (url)=>{

    return `<!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de senha</title>
        <style>
            body{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container{
                background-color: #ffffff;
                margin: 50px auto;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 1);
                max-width: 600px;
            }
            .header{
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content{
                padding: 20px;
                text-align: center;
            }
            .content p {
                font-size: 16px;
            }
            .button{
                display: inline-block;
                padding: 10px 20px;
                height: 20px;
                width: 100px;
                margin-top: 20px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
            }
            .footer{
                padding: 10px 20px;
                text-align: center;
                font-size: 12px;
                color: #777777;
            }
        </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Recuperação de senha</h1>
                </div>
                <div class="content">
                    <p>Recebemos uma solicitação para alterar sua senha. Clique no botao abaixo para redefinir sua senha!</p>
                    <a href="${url}" target="_blank" class="button">Redefinir Senha</a>
                </div>
                <div class="footer">
                    <p>Se você não solicitou esta alteração, por favor ignore-o.</p>
                </div>
            </div>
        </body>
        </html>  
    
    `
}
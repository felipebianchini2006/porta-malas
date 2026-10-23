"""Regressão de compartilhamento. Requer Playwright e banco exclusivo de QA.

CHECKIN_URL, QA_EMAIL e QA_PASSWORD devem apontar para o ambiente de teste.
Não envia mensagens: intercepta o destino externo do WhatsApp.
"""
import asyncio
import os
from urllib.parse import urlparse
from playwright.async_api import async_playwright, expect


async def run():
    url = os.environ["CHECKIN_URL"]
    origin = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
    async with async_playwright() as p:
        for engine in (p.chromium, p.webkit):
            browser = await engine.launch()
            context = await browser.new_context(accept_downloads=True)
            page = await context.new_page()
            await page.goto(f"{origin}/login")
            await page.get_by_label("E-mail").fill(os.environ["QA_EMAIL"])
            await page.get_by_label("Senha").fill(os.environ["QA_PASSWORD"])
            await page.get_by_role("button", name="Entrar", exact=True).click()
            await page.wait_for_url("**/dashboard")

            # Reprodução: processamento demora mais que a ativação do clique.
            # O share é uma fronteira do SO, substituída por uma sonda da ativação real.
            await context.add_init_script("""window.shareCalls = []; window.clickedAt = 0;
              document.addEventListener('click', ()=>{window.clickedAt=performance.now()}, true);
              Object.defineProperty(navigator, 'canShare', {configurable:true, writable:true, value:()=>true});
              Object.defineProperty(navigator, 'share', {configurable:true, writable:true, value: async (data)=> {
                window.shareCalls.push({active:navigator.userActivation.isActive,
                  delay:performance.now()-window.clickedAt, names:data.files.map(f=>f.name), text:data.text});
                if (!navigator.userActivation.isActive) throw new DOMException('No gesture','NotAllowedError');
              }});""")
            async def slow_photo(route):
                if route.request.resource_type == "fetch":
                    await asyncio.sleep(6)
                await route.continue_()
            await page.route("**/logo-bagpoint.jpeg", slow_photo)
            await page.goto(url)
            button = page.get_by_role("button", name="Compartilhar agora", exact=True)
            # No código antigo, a primeira tentativa perde a ativação; a segunda
            # é a que o cliente chama de "Compartilhar agora".
            old_button = page.get_by_role("button", name="Compartilhar fotos", exact=True)
            if await old_button.count():
                await old_button.click()
            await expect(button).to_be_enabled(timeout=20000)
            if not await page.evaluate("window.shareCalls.length"):
                await button.click()
            calls = await page.evaluate("window.shareCalls")
            assert calls[0]["active"] and calls[0]["delay"] < 1000, "SHARE_LOST_USER_ACTIVATION"
            assert calls[0]["names"] == ["bag-point-lacre-QA-LACRE-01.jpg"]
            assert "QA-D004" in calls[0]["text"]

            # Erro nativo deve oferecer recuperação, sem um ciclo de repetir clique.
            await page.evaluate("() => {navigator.share = async()=> {throw new DOMException('Blocked','NotAllowedError')}}")
            await button.click()
            await expect(page.get_by_role("link", name="Baixar foto 1 — lacre QA-LACRE")).to_be_visible()
            whatsapp = page.get_by_role("link", name="Abrir conversa no WhatsApp", exact=True)
            await expect(whatsapp).to_be_visible()

            # Cancelamento também libera o botão para tentar novamente.
            await page.evaluate("() => {navigator.share = async()=> {throw new DOMException('Canceled','AbortError')}}")
            await button.click()
            await expect(button).to_be_enabled()

            # Sem Web Share, os arquivos continuam acessíveis individualmente.
            await page.evaluate("() => {navigator.canShare = ()=>false}")
            await button.click()
            photo = page.get_by_role("link", name="Baixar foto 1 — lacre QA-LACRE")
            async with page.expect_download() as download:
                await photo.click()
            assert (await download.value).suggested_filename == "bag-point-lacre-QA-LACRE-01.jpg"

            # Simula ambiente que não permite janelas novas (ex.: navegador embutido).
            # O link deve navegar a página atual e preservar o texto do check-in.
            await context.route("https://wa.me/**", lambda route: route.fulfill(status=200, body="WhatsApp interceptado no teste"))
            confirm = page.get_by_role("link", name="Enviar Confirmação via WhatsApp", exact=True)
            assert await confirm.get_attribute("target") in (None, "_self"), "WHATSAPP_REQUIRES_POPUP"
            await confirm.click()
            await page.wait_for_url("https://wa.me/**")
            assert "5511999999999" in page.url and "aceite" in page.url
            assert len(context.pages) == 1
            print(f"PASS {engine.name}: ativação, arquivo/lacre, erro, cancelamento, download, confirmação")
            await browser.close()


asyncio.run(run())

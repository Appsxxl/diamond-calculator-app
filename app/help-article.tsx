import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCalculator } from "@/lib/calculator-context";
import { t } from "@/lib/translations";

// ─── Article content per language ────────────────────────────────────────────

type Section = { heading?: string; body: string };
type Article = { title: string; sections: Section[] };

function getArticle(articleId: string, lang: string): Article {
  const articles: Record<string, Record<string, Article>> = {
    "1": {
      en: {
        title: "How to Use the Calculator",
        sections: [
          {
            heading: "Step 1 — Set Your Start Deposit",
            body: "Enter the amount you want to start with in the 'Start Diamonds $' field. This is your initial capital that will grow each month based on your chosen SP level.",
          },
          {
            heading: "Step 2 — Set the Time Period",
            body: "Enter the number of years you want to simulate in the 'Years' field. The calculator will generate a monthly breakdown for the full period.",
          },
          {
            heading: "Step 3 — Configure Extra Deposits",
            body: "Under 'Deposit', enter an extra monthly amount and a 'Till' month to apply it. For example: Extra Amount = 500, Till = 12 means $500 is added every month for the first year.\n\nFor a one-time annual deposit, use the 'Extra Amounts Annual One Time' field and tap SET. This adds the amount once per year starting from month 13.",
          },
          {
            heading: "Step 4 — Configure Withdrawals",
            body: "Under 'Withdrawal', enter a fixed monthly amount and a 'From' month. For example: Monthly Amount = 300, From = 13 means you start withdrawing $300 per month from month 13 onwards.\n\nUnder 'Out %', enter a percentage of your monthly yield to withdraw. For example: 50% means half of your monthly earnings are paid out. Set a 'From' month to start the percentage withdrawal.",
          },
          {
            heading: "Step 5 — Set Compound %",
            body: "The compound percentage determines how much of your remaining balance (after withdrawals) is reinvested back into your capital. 100% = full reinvestment. Set a 'From' and 'Till' month to apply it to a specific period.",
          },
          {
            heading: "Step 6 — Toggle VIP",
            body: "Enable the VIP toggle to activate the VIP bonus. VIP costs $1,000 and is active for 12 months. It adds +3.0% to your base SP rate and earns $84/month into a separate VIP pot. After 12 months, VIP can be renewed automatically.",
          },
          {
            heading: "Step 7 — Set Your Goal",
            body: "Enter your monthly income goal in the 'Goal $' field. The progress bar shows how close your simulation is to reaching that goal. A '🎯 GOAL REACHED!' badge appears when your monthly output meets or exceeds the goal.",
          },
          {
            heading: "Step 8 — Calculate",
            body: "Tap the '⚡ CALCULATE' button. The results section will appear below with a summary (Total In, Total Out, Final Balance, ROC Break-Even) and the full monthly breakdown table.",
          },
          {
            heading: "Client Profiles — Save & Load",
            body: "Enter a client name in the 'Client name' field at the top of the form. Tap 💾 to save the current settings as a named profile. Tap 📂 to open your saved profiles and load a previous setup — use the search bar to quickly find a client by name.\n\nProfiles remember: client name, start deposit, years, VIP setting, goal amount, and all extra options.",
          },
          {
            heading: "SP Tier Quick-Select Buttons",
            body: "Below the Start Diamonds field, tap any SP tier chip to instantly set your start deposit to the minimum for that tier:\n\nSP2 → $1,000  |  SP3 → $2,500  |  SP4 → $5,000\nSP5 → $10,000  |  SP6 → $50,000  |  SP7 → $100,000\n\nTapping a chip clears any validation error on the start amount field.",
          },
          {
            heading: "Share Results & PDF Report",
            body: "After calculating, tap the Share button (beside the Copy button) to send your result summary via the system share sheet — email, notes, or messaging apps.\n\nTap 'PDF Report' to generate a formatted PDF with SP tier, VIP status, monthly goal, and all key figures. On iOS it opens the share sheet directly.",
          },
          {
            heading: "Extra Options Help (ⓘ)",
            body: "Tap the ⓘ button above the Deposit section to open a colour-coded guide for every advanced field:\n• Monthly Deposit — recurring top-up until a specified month\n• Annual Bonus — one-time yearly extra deposit from year 2\n• Fixed Withdrawal — fixed monthly payout from a given month\n• Out % — percentage of monthly yield paid out\n• Active Compounding % — how much of your balance is re-added to capital\n\nYou can combine multiple options to model complex strategies.",
          },
          {
            heading: "Bulk Operations Tip",
            body: "All bulk fields (Deposit, Withdrawal, Out%, Compound%) apply to a range of months at once. This saves time when configuring long simulations. You can also edit individual months directly in the results table.",
          },
        ],
      },
      nl: {
        title: "Hoe de Calculator te Gebruiken",
        sections: [
          { heading: "Stap 1 — Stel uw Startbedrag in", body: "Voer het bedrag in waarmee u wilt beginnen in het veld 'Start Diamanten $'. Dit is uw beginkapitaal dat elke maand groeit op basis van uw gekozen SP-niveau." },
          { heading: "Stap 2 — Stel de Tijdsperiode in", body: "Voer het aantal jaren in dat u wilt simuleren in het veld 'Jaren'. De calculator genereert een maandelijkse uitsplitsing voor de volledige periode." },
          { heading: "Stap 3 — Extra Stortingen Configureren", body: "Voer onder 'Storting' een extra maandelijks bedrag en een 'Tot'-maand in. Bijv.: Extra Bedrag = 500, Tot = 12 betekent dat er elke maand $500 wordt toegevoegd voor het eerste jaar.\n\nVoor een eenmalige jaarlijkse storting gebruikt u het veld 'Extra Bedragen Jaarlijks Eenmalig' en tikt u op INSTELLEN." },
          { heading: "Stap 4 — Opnames Configureren", body: "Voer onder 'Opname' een vast maandelijks bedrag en een 'Van'-maand in. Voer onder 'Opname %' een percentage van uw maandelijkse opbrengst in om op te nemen." },
          { heading: "Stap 5 — Samengesteld % Instellen", body: "Het samengestelde percentage bepaalt hoeveel van uw resterende saldo (na opnames) wordt herbelegd in uw kapitaal. 100% = volledige herbelegging." },
          { heading: "Stap 6 — VIP Activeren", body: "Schakel de VIP-schakelaar in om de VIP-bonus te activeren. VIP kost $1.000 en is 12 maanden actief. Het voegt +3,0% toe aan uw basis SP-tarief en verdient $84/maand in een aparte VIP-pot." },
          { heading: "Stap 7 — Stel uw Doel in", body: "Voer uw maandelijkse inkomensdoel in het veld 'Doel $' in. De voortgangsbalk toont hoe dicht uw simulatie bij het bereiken van dat doel is." },
          { heading: "Stap 8 — Berekenen", body: "Tik op de knop '⚡ BEREKENEN'. Het resultatengedeelte verschijnt hieronder met een samenvatting en de volledige maandelijkse uitsplitsingstabel." },
          { heading: "Klantprofielen — Opslaan & Laden", body: "Voer een klantnaam in het veld 'Klantnaam' bovenaan het formulier in. Tik op 💾 om de huidige instellingen als profiel op te slaan. Tik op 📂 om opgeslagen profielen te bekijken en te laden — gebruik de zoekbalk om snel een klant te vinden." },
          { heading: "SP-Niveau Snelkeuze Knoppen", body: "Onder het veld Start Diamanten tikt u op een SP-chip (SP2–SP7) om uw startbedrag direct in te stellen:\n\nSP2 → $1.000  |  SP3 → $2.500  |  SP4 → $5.000\nSP5 → $10.000  |  SP6 → $50.000  |  SP7 → $100.000" },
          { heading: "Resultaten Delen & PDF-rapport", body: "Na het berekenen tikt u op de knop Delen (naast Kopiëren) om uw resultaatoverzicht te delen via e-mail, notities of berichtenapps.\n\nTik op 'PDF-rapport' om een opgemaakt PDF-overzicht te genereren met SP-niveau, VIP-status, maandelijks doel en alle kerncijfers." },
          { heading: "Extra Opties Hulp (ⓘ)", body: "Tik op de ⓘ-knop boven het Stortingsgedeelte voor een kleurgecodeerde uitleg van elk geavanceerd veld:\n• Maandelijkse Storting, Jaarlijkse Bonus, Vaste Opname, Opname %, Actief Samengesteld %\n\nU kunt meerdere opties combineren om complexe strategieën te modelleren." },
        ],
      },
      de: {
        title: "Wie man den Rechner benutzt",
        sections: [
          { heading: "Schritt 1 — Starteinlage festlegen", body: "Geben Sie den Betrag, mit dem Sie beginnen möchten, in das Feld 'Start Diamanten $' ein. Dies ist Ihr Anfangskapital, das jeden Monat basierend auf Ihrem gewählten SP-Level wächst." },
          { heading: "Schritt 2 — Zeitraum festlegen", body: "Geben Sie die Anzahl der Jahre, die Sie simulieren möchten, in das Feld 'Jahre' ein." },
          { heading: "Schritt 3 — Zusätzliche Einzahlungen konfigurieren", body: "Geben Sie unter 'Einzahlung' einen zusätzlichen monatlichen Betrag und einen 'Bis'-Monat ein. Für eine einmalige Jahreseinzahlung verwenden Sie das Feld 'Zusätzliche Beträge Jährlich Einmalig'." },
          { heading: "Schritt 4 — Abhebungen konfigurieren", body: "Geben Sie unter 'Abhebung' einen festen monatlichen Betrag und einen 'Von'-Monat ein. Unter 'Abhebung %' geben Sie einen Prozentsatz Ihres monatlichen Ertrags ein." },
          { heading: "Schritt 5 — Zinseszins % einstellen", body: "Der Zinseszinsprozentsatz bestimmt, wie viel Ihres verbleibenden Guthabens (nach Abhebungen) in Ihr Kapital reinvestiert wird. 100% = vollständige Reinvestition." },
          { heading: "Schritt 6 — VIP aktivieren", body: "Aktivieren Sie den VIP-Schalter, um den VIP-Bonus zu aktivieren. VIP kostet $1.000 und ist 12 Monate aktiv. Es fügt +3,0% zu Ihrem Basis-SP-Satz hinzu." },
          { heading: "Schritt 7 — Ziel festlegen", body: "Geben Sie Ihr monatliches Einkommensziel in das Feld 'Ziel $' ein." },
          { heading: "Schritt 8 — Berechnen", body: "Tippen Sie auf die Schaltfläche '⚡ BERECHNEN'. Der Ergebnisbereich erscheint unten." },
          { heading: "Kundenprofile — Speichern & Laden", body: "Geben Sie einen Kundennamen in das Feld 'Kundenname' oben im Formular ein. Tippen Sie auf 💾, um die aktuellen Einstellungen als Profil zu speichern. Tippen Sie auf 📂, um gespeicherte Profile anzuzeigen und zu laden — nutzen Sie die Suchleiste zur schnellen Suche." },
          { heading: "SP-Level Schnellauswahl", body: "Tippen Sie unter dem Feld Start-Diamanten auf einen SP-Chip (SP2–SP7), um Ihren Startbetrag sofort einzustellen:\n\nSP2 → $1.000  |  SP3 → $2.500  |  SP4 → $5.000\nSP5 → $10.000  |  SP6 → $50.000  |  SP7 → $100.000" },
          { heading: "Ergebnisse Teilen & PDF-Bericht", body: "Nach der Berechnung tippen Sie auf die Schaltfläche Teilen (neben Kopieren), um Ihre Ergebniszusammenfassung zu teilen.\n\nTippen Sie auf 'PDF-Bericht', um eine formatierte PDF-Zusammenfassung mit SP-Level, VIP-Status und allen Kennzahlen zu erstellen." },
          { heading: "Hilfe zu Zusatzoptionen (ⓘ)", body: "Tippen Sie auf die ⓘ-Schaltfläche über dem Einzahlungsbereich für eine farbkodierte Erklärung jedes erweiterten Feldes:\n• Monatliche Einzahlung, Jahresbonus, Feste Abhebung, Abhebung %, Aktiver Zinseszins %\n\nSie können mehrere Optionen kombinieren, um komplexe Strategien zu modellieren." },
        ],
      },
      fr: {
        title: "Comment utiliser la calculatrice",
        sections: [
          { heading: "Étape 1 — Définir votre dépôt de départ", body: "Entrez le montant avec lequel vous souhaitez commencer dans le champ 'Diamants de départ $'. C'est votre capital initial qui croîtra chaque mois selon votre niveau SP choisi." },
          { heading: "Étape 2 — Définir la période", body: "Entrez le nombre d'années que vous souhaitez simuler dans le champ 'Années'." },
          { heading: "Étape 3 — Configurer les dépôts supplémentaires", body: "Sous 'Dépôt', entrez un montant mensuel supplémentaire et un mois 'Jusqu'à'. Pour un dépôt annuel unique, utilisez le champ 'Montants supplémentaires annuels ponctuels'." },
          { heading: "Étape 4 — Configurer les retraits", body: "Sous 'Retrait', entrez un montant mensuel fixe et un mois 'De'. Sous 'Retrait %', entrez un pourcentage de votre rendement mensuel à retirer." },
          { heading: "Étape 5 — Définir le % composé", body: "Le pourcentage composé détermine combien de votre solde restant (après retraits) est réinvesti dans votre capital. 100% = réinvestissement total." },
          { heading: "Étape 6 — Activer VIP", body: "Activez le bouton VIP pour activer le bonus VIP. Le VIP coûte 1 000 $ et est actif pendant 12 mois. Il ajoute +3,0% à votre taux SP de base." },
          { heading: "Étape 7 — Définir votre objectif", body: "Entrez votre objectif de revenu mensuel dans le champ 'Objectif $'." },
          { heading: "Étape 8 — Calculer", body: "Appuyez sur le bouton '⚡ CALCULER'. La section des résultats apparaîtra ci-dessous." },
          { heading: "Profils clients — Sauvegarder & Charger", body: "Entrez un nom de client dans le champ 'Nom du client' en haut du formulaire. Appuyez sur 💾 pour sauvegarder les paramètres actuels comme profil nommé. Appuyez sur 📂 pour charger un profil précédent — utilisez la barre de recherche pour trouver un client rapidement." },
          { heading: "Boutons de sélection rapide SP", body: "Sous le champ Diamants de départ, appuyez sur une puce SP (SP2–SP7) pour définir instantanément votre dépôt de départ:\n\nSP2 → 1 000 $  |  SP3 → 2 500 $  |  SP4 → 5 000 $\nSP5 → 10 000 $  |  SP6 → 50 000 $  |  SP7 → 100 000 $" },
          { heading: "Partager les résultats & Rapport PDF", body: "Après le calcul, appuyez sur le bouton Partager (à côté de Copier) pour partager votre résumé de résultats.\n\nAppuyez sur 'Rapport PDF' pour générer un PDF formaté avec niveau SP, statut VIP et toutes les données clés." },
          { heading: "Aide pour les options supplémentaires (ⓘ)", body: "Appuyez sur le bouton ⓘ au-dessus de la section Dépôt pour obtenir une explication codée par couleur de chaque champ avancé:\n• Dépôt mensuel, Bonus annuel, Retrait fixe, Retrait %, Intérêt composé actif %\n\nVous pouvez combiner plusieurs options pour modéliser des stratégies complexes." },
        ],
      },
      es: {
        title: "Cómo usar la calculadora",
        sections: [
          { heading: "Paso 1 — Establecer su depósito inicial", body: "Ingrese el monto con el que desea comenzar en el campo 'Diamantes iniciales $'. Este es su capital inicial que crecerá cada mes según su nivel SP elegido." },
          { heading: "Paso 2 — Establecer el período de tiempo", body: "Ingrese el número de años que desea simular en el campo 'Años'." },
          { heading: "Paso 3 — Configurar depósitos adicionales", body: "En 'Depósito', ingrese un monto mensual adicional y un mes 'Hasta'. Para un depósito anual único, use el campo 'Montos adicionales anuales únicos'." },
          { heading: "Paso 4 — Configurar retiros", body: "En 'Retiro', ingrese un monto mensual fijo y un mes 'Desde'. En 'Retiro %', ingrese un porcentaje de su rendimiento mensual para retirar." },
          { heading: "Paso 5 — Establecer el % compuesto", body: "El porcentaje compuesto determina cuánto de su saldo restante (después de retiros) se reinvierte en su capital. 100% = reinversión completa." },
          { heading: "Paso 6 — Activar VIP", body: "Active el interruptor VIP para activar el bono VIP. El VIP cuesta $1,000 y está activo durante 12 meses. Agrega +3.0% a su tasa SP base." },
          { heading: "Paso 7 — Establecer su objetivo", body: "Ingrese su objetivo de ingresos mensuales en el campo 'Objetivo $'." },
          { heading: "Paso 8 — Calcular", body: "Toque el botón '⚡ CALCULAR'. La sección de resultados aparecerá a continuación." },
          { heading: "Perfiles de clientes — Guardar & Cargar", body: "Ingrese un nombre de cliente en el campo 'Nombre de cliente' en la parte superior del formulario. Toque 💾 para guardar la configuración actual como perfil. Toque 📂 para cargar un perfil anterior — use la barra de búsqueda para encontrar un cliente rápidamente." },
          { heading: "Botones de selección rápida SP", body: "Debajo del campo Diamantes iniciales, toque cualquier chip SP (SP2–SP7) para establecer instantáneamente su depósito inicial:\n\nSP2 → $1,000  |  SP3 → $2,500  |  SP4 → $5,000\nSP5 → $10,000  |  SP6 → $50,000  |  SP7 → $100,000" },
          { heading: "Compartir resultados & Informe PDF", body: "Después de calcular, toque el botón Compartir (junto a Copiar) para compartir su resumen de resultados.\n\nToque 'Informe PDF' para generar un PDF formateado con nivel SP, estado VIP y todos los datos clave." },
          { heading: "Ayuda para opciones adicionales (ⓘ)", body: "Toque el botón ⓘ encima de la sección Depósito para obtener una guía codificada por colores de cada campo avanzado:\n• Depósito mensual, Bono anual, Retiro fijo, Retiro %, Interés compuesto activo %\n\nPuede combinar múltiples opciones para modelar estrategias complejas." },
        ],
      },
      ru: {
        title: "Как пользоваться калькулятором",
        sections: [
          { heading: "Шаг 1 — Введите начальный депозит", body: "Введите сумму в поле «Начальные алмазы $». Это ваш начальный капитал, который будет расти каждый месяц в зависимости от выбранного уровня SP." },
          { heading: "Шаг 2 — Установите период", body: "Введите количество лет в поле «Лет». Калькулятор создаст помесячную таблицу за весь период." },
          { heading: "Шаг 3 — Настройте дополнительные депозиты", body: "В разделе «Депозит» введите дополнительную ежемесячную сумму и месяц «До». Например: $500 до месяца 12 = $500 каждый месяц в первый год.\n\nДля разового годового депозита используйте поле «Доп. суммы ежегодно разово» и нажмите УСТАНОВИТЬ." },
          { heading: "Шаг 4 — Настройте вывод средств", body: "В разделе «Вывод» введите фиксированную ежемесячную сумму и месяц «С». В разделе «Вывод %» введите процент от ежемесячного дохода для вывода." },
          { heading: "Шаг 5 — Установите % сложного процента", body: "Процент сложного процента определяет, какая часть остатка реинвестируется. 100% = полное реинвестирование. Установите месяцы «С» и «До»." },
          { heading: "Шаг 6 — Активируйте VIP", body: "Включите переключатель VIP. VIP стоит $1 000, действует 12 месяцев. Добавляет +3,0% к базовой ставке SP и $84/месяц в VIP-котёл." },
          { heading: "Шаг 7 — Установите цель", body: "Введите ежемесячный доход-цель в поле «Цель $». Прогресс-бар показывает, насколько ваша симуляция близка к достижению цели." },
          { heading: "Шаг 8 — Рассчитайте", body: "Нажмите кнопку «⚡ РАССЧИТАТЬ». Появится раздел результатов со сводкой и полной помесячной таблицей." },
          { heading: "Клиентские профили — Сохранение и загрузка", body: "Введите имя клиента в поле «Имя клиента» вверху. Нажмите 💾 для сохранения, 📂 для загрузки профиля. Используйте строку поиска для быстрого поиска." },
          { heading: "Быстрый выбор уровня SP", body: "Под полем «Начальные алмазы» нажмите на чип SP для мгновенной установки депозита:\n\nSP2 → $1 000  |  SP3 → $2 500  |  SP4 → $5 000\nSP5 → $10 000  |  SP6 → $50 000  |  SP7 → $100 000" },
          { heading: "Поделиться результатами и PDF-отчёт", body: "После расчёта нажмите «Поделиться» для отправки сводки. Нажмите «PDF-отчёт» для создания форматированного PDF." },
          { heading: "Помощь по доп. параметрам (ⓘ)", body: "Нажмите ⓘ над разделом «Депозит» для цветового руководства:\n• Ежемесячный депозит, Годовой бонус, Фиксированный вывод, Вывод %, Активный сложный %\n\nПараметры можно комбинировать." },
        ],
      },
      zh: {
        title: "如何使用计算器",
        sections: [
          { heading: "第1步 — 设置初始存款", body: "在「初始钻石 $」字段中输入起始金额。这是您的初始资本，将根据所选SP级别每月增长。" },
          { heading: "第2步 — 设置时间段", body: "在「年数」字段中输入要模拟的年数。计算器将生成完整期间的月度明细。" },
          { heading: "第3步 — 配置额外存款", body: "在「存款」下，输入额外月度金额和「截止到」月份。例如：$500 截止第12个月 = 第一年每月添加$500。\n\n对于一次性年度存款，使用「额外金额年度一次性」字段并点击「设置」。" },
          { heading: "第4步 — 配置提款", body: "在「提款」下，输入固定月度金额和「从」月份。在「提款 %」下，输入要提取的月度收益百分比。" },
          { heading: "第5步 — 设置复利 %", body: "复利百分比决定剩余余额中有多少被重新投入资本。100% = 完全再投资。设置「从」和「到」月份。" },
          { heading: "第6步 — 启用VIP", body: "启用VIP开关。VIP费用$1,000，有效期12个月。为SP基础率增加+3.0%，并每月向VIP池存入$84。" },
          { heading: "第7步 — 设置目标", body: "在「目标 $」字段中输入月收入目标。进度条显示模拟距达成目标的进度。" },
          { heading: "第8步 — 计算", body: "点击「⚡ 计算」按钮。结果部分将显示摘要和完整月度明细表。" },
          { heading: "客户档案 — 保存和加载", body: "在「客户名称」字段中输入客户姓名。点击 💾 保存当前设置，点击 📂 加载已保存的档案。使用搜索栏快速查找客户。" },
          { heading: "SP级别快速选择按钮", body: "在初始钻石字段下方点击SP级别芯片即可立即设置存款金额：\n\nSP2 → $1,000  |  SP3 → $2,500  |  SP4 → $5,000\nSP5 → $10,000  |  SP6 → $50,000  |  SP7 → $100,000" },
          { heading: "分享结果和PDF报告", body: "计算后点击分享按钮发送结果摘要。点击「PDF报告」生成包含所有关键数据的格式化PDF。" },
          { heading: "额外选项帮助 (ⓘ)", body: "点击存款部分上方的 ⓘ 按钮获取彩色编码说明：\n• 月度存款、年度奖金、固定提款、提款 %、主动复利 %\n\n您可以组合多个选项来模拟复杂策略。" },
        ],
      },
    },
    "2": {
      en: {
        title: "Understanding Investment Strategies",
        sections: [
          {
            heading: "The 4 Strategic Plans",
            body: "The Strategy Engineer calculates 4 different plans to reach your monthly income goal. Each plan uses a different approach. Enter your start deposit and monthly income goal, then tap Calculate to see all 4 plans.",
          },
          {
            heading: "Plan A — Monthly Top-Up Strategy",
            body: "You add a fixed amount every month until your capital is large enough to generate your goal income on its own.\n\nExample: Goal = $2,000/month, Start = $10,000 → Plan A tells you to add $X per month for Y months. After that period, your capital generates $2,000/month without further deposits.\n\nBest for: People who can commit to regular monthly contributions.",
          },
          {
            heading: "Plan B — Wait & Grow Strategy",
            body: "You make no additional deposits. You simply wait for your existing capital to compound and grow to the level needed to generate your goal income.\n\nExample: Goal = $2,000/month, Start = $10,000 → Plan B tells you to wait Z months. Your capital grows purely through compound interest.\n\nBest for: People who want a hands-off approach and have patience.",
          },
          {
            heading: "Plan C — One-Year Lump Sum Strategy",
            body: "You make one large deposit now, compound it for 12 months at 100%, then start withdrawing your goal income.\n\nExample: Goal = $2,000/month → Plan C tells you the exact lump sum needed today. After 12 months of compounding, your capital generates $2,000/month.\n\nBest for: People who have a large amount available to invest now.",
          },
          {
            heading: "Plan D — Instant Payout Strategy",
            body: "You deposit a large amount and immediately start withdrawing 75% of your monthly yield as income.\n\nExample: Goal = $2,000/month → Plan D tells you the exact amount needed. From month 1, you receive 75% of yield = your goal income.\n\nBest for: People who need income immediately without a waiting period.",
          },
          {
            heading: "Applying a Plan to the Scenario Tool",
            body: "After calculating, each plan card shows an '▶ Apply Plan X to Scenario Tool' button. Tapping it automatically fills in the Scenario Tool with the exact values for that plan — start deposit, monthly deposit, years, VIP setting, and goal amount. You can then run the full monthly simulation to see the detailed breakdown.",
          },
          {
            heading: "SP Levels Explained",
            body: "Your SP level is determined by your current capital balance:\n\nSP1: $110–$999 → 2.2% base (5.2% VIP)\nSP2: $1K–$2.5K → 2.45% base (5.45% VIP)\nSP3: $2.5K–$5K → 2.7% base (5.7% VIP)\nSP4: $5K–$10K → 3.0% base (6.0% VIP)\nSP5: $10K–$50K → 3.1% base (6.1% VIP)\nSP6: $50K–$100K → 3.2% base (6.2% VIP)\nSP7: $100K+ → 3.3% base (6.3% VIP)\n\nAs your capital grows, you automatically move to higher SP levels with better rates.",
          },
          {
            heading: "VIP Activation",
            body: "VIP costs $1,000 and is active for 12 months. Benefits:\n• +3.0% added to your base SP rate\n• $84/month credited to your VIP pot\n• VIP pot is separate from your main capital\n\nVIP is most effective when your capital is at a lower SP level, as the +3.0% bonus has a larger relative impact.",
          },
          {
            heading: "Compound Percentage",
            body: "The compound percentage (0–100%) controls how much of your available balance after withdrawals is reinvested. At 100%, all remaining balance compounds. At 50%, half is compounded and half stays in your wallet. Higher compound = faster capital growth but lower immediate liquidity.",
          },
        ],
      },
      nl: {
        title: "Investeringsstrategieën Begrijpen",
        sections: [
          { heading: "De 4 Strategische Plannen", body: "De Strategie Engineer berekent 4 verschillende plannen om uw maandelijkse inkomensdoel te bereiken. Voer uw startbedrag en maandelijks inkomensdoel in en tik op Berekenen om alle 4 plannen te zien." },
          { heading: "Plan A — Maandelijkse Bijstorting", body: "U voegt elke maand een vast bedrag toe totdat uw kapitaal groot genoeg is om uw doelinkomen te genereren.\n\nBest voor: Mensen die regelmatige maandelijkse bijdragen kunnen doen." },
          { heading: "Plan B — Wachten & Groeien", body: "U doet geen extra stortingen. U wacht gewoon tot uw bestaande kapitaal aangroeit tot het niveau dat nodig is om uw doelinkomen te genereren.\n\nBest voor: Mensen die een hands-off aanpak willen en geduld hebben." },
          { heading: "Plan C — Eenmalige Jaarlijkse Storting", body: "U doet nu één grote storting, laat het 12 maanden op 100% aangroeien en begint dan uw doelinkomen op te nemen.\n\nBest voor: Mensen die nu een groot bedrag beschikbaar hebben." },
          { heading: "Plan D — Directe Uitbetaling", body: "U stort een groot bedrag en begint onmiddellijk 75% van uw maandelijkse opbrengst als inkomen op te nemen.\n\nBest voor: Mensen die onmiddellijk inkomen nodig hebben." },
          { heading: "Plan Toepassen op Scenario Tool", body: "Na het berekenen toont elke plankaart een '▶ Plan X Toepassen op Scenario Tool' knop. Door erop te tikken worden de exacte waarden voor dat plan automatisch ingevuld in de Scenario Tool." },
          { heading: "SP Niveaus Uitgelegd", body: "Uw SP-niveau wordt bepaald door uw huidige kapitaalsaldo:\n\nSP1: $110–$999 → 2,2% basis (5,2% VIP)\nSP2: $1K–$2,5K → 2,45% basis (5,45% VIP)\nSP3: $2,5K–$5K → 2,7% basis (5,7% VIP)\nSP4: $5K–$10K → 3,0% basis (6,0% VIP)\nSP5: $10K–$50K → 3,1% basis (6,1% VIP)\nSP6: $50K–$100K → 3,2% basis (6,2% VIP)\nSP7: $100K+ → 3,3% basis (6,3% VIP)" },
          { heading: "VIP Activering", body: "VIP kost $1.000 en is 12 maanden actief. Voordelen: +3,0% toegevoegd aan uw basis SP-tarief, $84/maand bijgeschreven op uw VIP-pot." },
        ],
      },
      de: {
        title: "Anlagestrategien verstehen",
        sections: [
          { heading: "Die 4 Strategischen Pläne", body: "Der Strategie-Ingenieur berechnet 4 verschiedene Pläne, um Ihr monatliches Einkommensziel zu erreichen. Geben Sie Ihre Starteinlage und Ihr monatliches Einkommensziel ein und tippen Sie auf Berechnen." },
          { heading: "Plan A — Monatliche Aufstockung", body: "Sie fügen jeden Monat einen festen Betrag hinzu, bis Ihr Kapital groß genug ist, um Ihr Zieleinkommen zu generieren.\n\nAm besten für: Menschen, die regelmäßige monatliche Beiträge leisten können." },
          { heading: "Plan B — Warten & Wachsen", body: "Sie leisten keine zusätzlichen Einzahlungen. Sie warten einfach, bis Ihr bestehendes Kapital angewachsen ist.\n\nAm besten für: Menschen, die einen hands-off Ansatz wollen." },
          { heading: "Plan C — Einmalige Jahreseinzahlung", body: "Sie leisten jetzt eine große Einzahlung, lassen sie 12 Monate bei 100% anwachsen und beginnen dann, Ihr Zieleinkommen abzuheben.\n\nAm besten für: Menschen mit einem großen verfügbaren Betrag." },
          { heading: "Plan D — Sofortige Auszahlung", body: "Sie zahlen einen großen Betrag ein und beginnen sofort, 75% Ihres monatlichen Ertrags als Einkommen abzuheben.\n\nAm besten für: Menschen, die sofort Einkommen benötigen." },
          { heading: "SP-Level erklärt", body: "SP1: $110–$999 → 2,2% Basis\nSP2: $1K–$2,5K → 2,45% Basis\nSP3: $2,5K–$5K → 2,7% Basis\nSP4: $5K–$10K → 3,0% Basis\nSP5: $10K–$50K → 3,1% Basis\nSP6: $50K–$100K → 3,2% Basis\nSP7: $100K+ → 3,3% Basis" },
          { heading: "VIP-Aktivierung", body: "VIP kostet $1.000 und ist 12 Monate aktiv. Vorteile: +3,0% zu Ihrem Basis-SP-Satz, $84/Monat in Ihren VIP-Topf." },
        ],
      },
      fr: {
        title: "Comprendre les stratégies d'investissement",
        sections: [
          { heading: "Les 4 plans stratégiques", body: "L'ingénieur de stratégie calcule 4 plans différents pour atteindre votre objectif de revenu mensuel. Entrez votre dépôt de départ et votre objectif de revenu mensuel, puis appuyez sur Calculer." },
          { heading: "Plan A — Recharge mensuelle", body: "Vous ajoutez un montant fixe chaque mois jusqu'à ce que votre capital soit suffisamment grand pour générer votre revenu cible.\n\nIdéal pour: Les personnes pouvant s'engager à des contributions mensuelles régulières." },
          { heading: "Plan B — Attendre et croître", body: "Vous ne faites pas de dépôts supplémentaires. Vous attendez simplement que votre capital existant croisse.\n\nIdéal pour: Les personnes qui veulent une approche passive." },
          { heading: "Plan C — Somme forfaitaire annuelle", body: "Vous effectuez maintenant un grand dépôt, le composez pendant 12 mois à 100%, puis commencez à retirer votre revenu cible.\n\nIdéal pour: Les personnes disposant d'un grand montant disponible." },
          { heading: "Plan D — Paiement instantané", body: "Vous déposez un grand montant et commencez immédiatement à retirer 75% de votre rendement mensuel.\n\nIdéal pour: Les personnes ayant besoin de revenus immédiats." },
          { heading: "Niveaux SP expliqués", body: "SP1: $110–$999 → 2,2% de base\nSP2: $1K–$2,5K → 2,45% de base\nSP3: $2,5K–$5K → 2,7% de base\nSP4: $5K–$10K → 3,0% de base\nSP5: $10K–$50K → 3,1% de base\nSP6: $50K–$100K → 3,2% de base\nSP7: $100K+ → 3,3% de base" },
          { heading: "Activation VIP", body: "Le VIP coûte 1 000 $ et est actif pendant 12 mois. Avantages: +3,0% ajouté à votre taux SP de base, 84 $/mois crédités sur votre pot VIP." },
        ],
      },
      es: {
        title: "Entendiendo las estrategias de inversión",
        sections: [
          { heading: "Los 4 planes estratégicos", body: "El Ingeniero de Estrategia calcula 4 planes diferentes para alcanzar su objetivo de ingresos mensuales. Ingrese su depósito inicial y su objetivo de ingresos mensuales, luego toque Calcular." },
          { heading: "Plan A — Recarga mensual", body: "Agrega un monto fijo cada mes hasta que su capital sea lo suficientemente grande como para generar sus ingresos objetivo.\n\nIdeal para: Personas que pueden comprometerse con contribuciones mensuales regulares." },
          { heading: "Plan B — Esperar y crecer", body: "No realiza depósitos adicionales. Simplemente espera a que su capital existente crezca.\n\nIdeal para: Personas que desean un enfoque pasivo." },
          { heading: "Plan C — Suma global anual", body: "Realiza un gran depósito ahora, lo compone durante 12 meses al 100%, luego comienza a retirar sus ingresos objetivo.\n\nIdeal para: Personas con una gran cantidad disponible." },
          { heading: "Plan D — Pago instantáneo", body: "Deposita una gran cantidad y comienza inmediatamente a retirar el 75% de su rendimiento mensual.\n\nIdeal para: Personas que necesitan ingresos de inmediato." },
          { heading: "Niveles SP explicados", body: "SP1: $110–$999 → 2,2% base\nSP2: $1K–$2,5K → 2,45% base\nSP3: $2,5K–$5K → 2,7% base\nSP4: $5K–$10K → 3,0% base\nSP5: $10K–$50K → 3,1% base\nSP6: $50K–$100K → 3,2% base\nSP7: $100K+ → 3,3% base" },
          { heading: "Activación VIP", body: "El VIP cuesta $1,000 y está activo durante 12 meses. Beneficios: +3.0% añadido a su tasa SP base, $84/mes acreditados en su bote VIP." },
        ],
      },
      ru: {
        title: "Понимание инвестиционных стратегий",
        sections: [
          { heading: "4 стратегических плана", body: "Инженер стратегий рассчитывает 4 различных плана достижения ежемесячного дохода-цели. Введите начальный депозит и цель, затем нажмите «Рассчитать»." },
          { heading: "План A — Ежемесячное пополнение", body: "Вы добавляете фиксированную сумму каждый месяц, пока капитал не достигнет уровня, достаточного для генерации целевого дохода.\n\nЛучший вариант для: людей, готовых к регулярным ежемесячным взносам." },
          { heading: "План B — Ожидание и рост", body: "Без дополнительных депозитов. Ваш капитал растёт за счёт сложного процента до достижения нужного уровня.\n\nЛучший вариант для: тех, кто предпочитает пассивный подход и имеет терпение." },
          { heading: "План C — Единовременный депозит на год", body: "Вы делаете один крупный взнос сейчас, накапливаете его 12 месяцев при 100%, затем начинаете выводить целевой доход.\n\nЛучший вариант для: тех, у кого есть крупная сумма для инвестиции сейчас." },
          { heading: "План D — Мгновенная выплата", body: "Вы вносите крупную сумму и сразу начинаете выводить 75% ежемесячного дохода.\n\nЛучший вариант для: тех, кому нужен доход немедленно." },
          { heading: "Применить план в инструменте сценариев", body: "После расчёта каждая карточка плана показывает кнопку «▶ Применить план X». Нажатие автоматически заполняет инструмент сценариев точными значениями." },
          { heading: "Уровни SP", body: "Ваш уровень SP определяется текущим балансом:\n\nSP1: $110–$999 → 2,2% базовая (5,2% VIP)\nSP2: $1K–$2,5K → 2,45% базовая (5,45% VIP)\nSP3: $2,5K–$5K → 2,7% базовая (5,7% VIP)\nSP4: $5K–$10K → 3,0% базовая (6,0% VIP)\nSP5: $10K–$50K → 3,1% базовая (6,1% VIP)\nSP6: $50K–$100K → 3,2% базовая (6,2% VIP)\nSP7: $100K+ → 3,3% базовая (6,3% VIP)" },
          { heading: "Активация VIP", body: "VIP стоит $1 000 и действует 12 месяцев. Преимущества: +3,0% к базовой ставке SP, $84/месяц в VIP-котёл." },
          { heading: "Процент сложного процента", body: "Процент (0–100%) управляет тем, какая часть баланса после вывода реинвестируется. 100% = полное реинвестирование. Выше процент = быстрее рост капитала." },
        ],
      },
      zh: {
        title: "了解投资策略",
        sections: [
          { heading: "4个战略方案", body: "策略工程师计算4种不同的方案来达到您的月收入目标。输入初始存款和月收入目标，然后点击「计算」查看所有4个方案。" },
          { heading: "方案A — 每月追加策略", body: "您每月添加固定金额，直到资本足够大能够产生目标收入。\n\n最适合：能够承诺定期月度投入的人。" },
          { heading: "方案B — 等待和增长策略", body: "无需额外存款。只需等待现有资本通过复利增长到产生目标收入所需的水平。\n\n最适合：希望采用被动方式且有耐心的人。" },
          { heading: "方案C — 一年期一次性策略", body: "现在存入一大笔资金，以100%复利积累12个月，然后开始提取目标收入。\n\n最适合：现在有大额资金可用于投资的人。" },
          { heading: "方案D — 即时收益策略", body: "存入大额资金并立即开始提取75%的月度收益作为收入。\n\n最适合：需要立即获得收入的人。" },
          { heading: "将方案应用到情景工具", body: "计算后，每个方案卡片显示「▶ 将方案X应用到情景工具」按钮，点击后自动填入精确值。" },
          { heading: "SP级别说明", body: "您的SP级别由当前资本余额决定：\n\nSP1: $110–$999 → 2.2%基础 (5.2% VIP)\nSP2: $1K–$2.5K → 2.45%基础 (5.45% VIP)\nSP3: $2.5K–$5K → 2.7%基础 (5.7% VIP)\nSP4: $5K–$10K → 3.0%基础 (6.0% VIP)\nSP5: $10K–$50K → 3.1%基础 (6.1% VIP)\nSP6: $50K–$100K → 3.2%基础 (6.2% VIP)\nSP7: $100K+ → 3.3%基础 (6.3% VIP)" },
          { heading: "VIP激活", body: "VIP费用$1,000，有效期12个月。优势：SP基础率+3.0%，每月$84存入VIP池。" },
          { heading: "复利百分比", body: "复利百分比（0–100%）控制提款后有多少被再投资。100% = 完全再投资。复利越高，资本增长越快，即时流动性越低。" },
        ],
      },
    },
    "3": {
      en: {
        title: "Reading the Monthly Breakdown",
        sections: [
          {
            heading: "Overview",
            body: "The monthly breakdown table shows exactly what happens to your capital each month. Each row is one month. You can edit individual month values directly in the table.",
          },
          {
            heading: "Column: M (Month Number)",
            body: "The sequential month number starting from 1. Year separator rows appear between months (e.g., '── Year 2 Sale Diamonds ──') to mark the start of each new year.",
          },
          {
            heading: "Column: Diamonds (Start Capital)",
            body: "Your capital balance at the START of the month, before any deposits or yield is applied. This is the value used to determine your SP level for that month.",
          },
          {
            heading: "Column: Deposit",
            body: "The extra deposit added this month. You can edit this directly in the table. Positive values increase your capital.",
          },
          {
            heading: "Column: Out% (Withdrawal Percentage)",
            body: "The percentage of your gross monthly yield that is paid out as a withdrawal. 0% = no payout, 100% = full yield paid out. You can edit this per month.",
          },
          {
            heading: "Column: Withdrawal (Fixed Amount)",
            body: "A fixed amount withdrawn from your available balance this month. Combined with Out%, this determines your total monthly payout.",
          },
          {
            heading: "Column: Comp% (Compound Percentage)",
            body: "The percentage of your remaining balance (after withdrawals) that is reinvested into your capital. 100% = full reinvestment. The compound amount is added to a 'CompPot' — it only gets added to your main capital when the CompPot reaches $100 or more.",
          },
          {
            heading: "Column: Plan (SP Level)",
            body: "The SP level active this month (SP1–SP7), determined by your start capital for that month. Higher SP = better base rate.",
          },
          {
            heading: "Column: Discount",
            body: "Any discount applied to the yield calculation. This is used in special scenarios where a reduced rate applies.",
          },
          {
            heading: "Column: Status",
            body: "Shows the current state of your capital:\n• 🟢 Growing — capital is increasing\n• 🟡 VIP — VIP bonus is active this month (shown as 'NEW VIP' in month 1 of VIP, then 'VIP 1', 'VIP 2', etc.)\n• 🔴 Withdrawal — a withdrawal was made this month",
          },
          {
            heading: "Column: Total Diamonds (End Capital)",
            body: "Your capital balance at the END of the month, after all deposits, yield, withdrawals, and compounding have been applied. This becomes the 'Diamonds' value for the next month.",
          },
          {
            heading: "Summary Statistics",
            body: "Above the table:\n• Total In — sum of all deposits made\n• Total Out — sum of all withdrawals made\n• Final Balance — your capital at the end of the simulation\n• Net Result — Final Balance minus Total In\n• Wallet+Pots — your wallet balance plus VIP pot plus CompPot\n• VIP Cost — total VIP fees paid\n• Max Monthly Out — highest single-month withdrawal\n• ROC Break-Even — the month when your total withdrawals equal your total deposits (return of capital)",
          },
        ],
      },
      nl: {
        title: "De Maandelijkse Uitsplitsing Lezen",
        sections: [
          { heading: "Overzicht", body: "De maandelijkse uitsplitsingstabel toont precies wat er elke maand met uw kapitaal gebeurt. Elke rij is één maand." },
          { heading: "Kolom: M (Maandnummer)", body: "Het opeenvolgende maandnummer vanaf 1. Jaarscheidingsrijen verschijnen tussen maanden om het begin van elk nieuw jaar te markeren." },
          { heading: "Kolom: Diamanten (Startkapitaal)", body: "Uw kapitaalsaldo aan het BEGIN van de maand, vóór stortingen of opbrengst. Dit bepaalt uw SP-niveau voor die maand." },
          { heading: "Kolom: Storting", body: "De extra storting die deze maand is toegevoegd. U kunt dit direct in de tabel bewerken." },
          { heading: "Kolom: Opname % (Opnamepercentage)", body: "Het percentage van uw bruto maandelijkse opbrengst dat als opname wordt uitbetaald." },
          { heading: "Kolom: Opname (Vast Bedrag)", body: "Een vast bedrag dat deze maand van uw beschikbaar saldo wordt opgenomen." },
          { heading: "Kolom: Samengesteld % (Compound Percentage)", body: "Het percentage van uw resterende saldo (na opnames) dat wordt herbelegd. Het samengestelde bedrag wordt toegevoegd aan een 'CompPot' — het wordt alleen aan uw hoofdkapitaal toegevoegd wanneer de CompPot $100 of meer bereikt." },
          { heading: "Kolom: Plan (SP Niveau)", body: "Het SP-niveau dat deze maand actief is (SP1–SP7), bepaald door uw startkapitaal voor die maand." },
          { heading: "Kolom: Status", body: "Toont de huidige staat van uw kapitaal:\n• 🟢 Groeiend\n• 🟡 VIP actief\n• 🔴 Opname gedaan" },
          { heading: "Kolom: Totaal Diamanten (Eindkapitaal)", body: "Uw kapitaalsaldo aan het EINDE van de maand, na alle stortingen, opbrengsten, opnames en samengestelde rente." },
          { heading: "Samenvattingsstatistieken", body: "Totaal In, Totaal Uit, Eindbalans, Nettoresultaat, Portemonnee+Potten, VIP-kosten, Max Maandelijkse Opname, ROC Break-Even." },
        ],
      },
      de: {
        title: "Die monatliche Aufschlüsselung lesen",
        sections: [
          { heading: "Übersicht", body: "Die monatliche Aufschlüsselungstabelle zeigt genau, was jeden Monat mit Ihrem Kapital passiert. Jede Zeile ist ein Monat." },
          { heading: "Spalte: M (Monatsnummer)", body: "Die fortlaufende Monatsnummer ab 1. Jahrestrennzeilen erscheinen zwischen Monaten." },
          { heading: "Spalte: Diamanten (Startkapital)", body: "Ihr Kapitalguthaben zu BEGINN des Monats, vor Einzahlungen oder Ertrag. Dies bestimmt Ihr SP-Level für diesen Monat." },
          { heading: "Spalte: Einzahlung", body: "Die zusätzliche Einzahlung, die in diesem Monat hinzugefügt wurde. Sie können dies direkt in der Tabelle bearbeiten." },
          { heading: "Spalte: Abhebung % (Abhebungsprozentsatz)", body: "Der Prozentsatz Ihres monatlichen Bruttoetrags, der als Abhebung ausgezahlt wird." },
          { heading: "Spalte: Abhebung (Fester Betrag)", body: "Ein fester Betrag, der in diesem Monat von Ihrem verfügbaren Guthaben abgehoben wird." },
          { heading: "Spalte: Zinseszins %", body: "Der Prozentsatz Ihres verbleibenden Guthabens (nach Abhebungen), der reinvestiert wird. Der Zinseszinsbetrag wird einem 'CompPot' hinzugefügt — er wird nur Ihrem Hauptkapital hinzugefügt, wenn der CompPot $100 oder mehr erreicht." },
          { heading: "Spalte: Status", body: "Zeigt den aktuellen Zustand Ihres Kapitals:\n• 🟢 Wachsend\n• 🟡 VIP aktiv\n• 🔴 Abhebung getätigt" },
          { heading: "Zusammenfassungsstatistiken", body: "Gesamt Einzahlung, Gesamt Abhebung, Endsaldo, Nettoresultat, Geldbörse+Töpfe, VIP-Kosten, Max. monatliche Abhebung, ROC Break-Even." },
        ],
      },
      fr: {
        title: "Lire le tableau mensuel",
        sections: [
          { heading: "Aperçu", body: "Le tableau de ventilation mensuelle montre exactement ce qui arrive à votre capital chaque mois. Chaque ligne est un mois." },
          { heading: "Colonne: M (Numéro de mois)", body: "Le numéro de mois séquentiel à partir de 1. Des lignes de séparation annuelle apparaissent entre les mois." },
          { heading: "Colonne: Diamants (Capital de départ)", body: "Votre solde de capital au DÉBUT du mois, avant les dépôts ou le rendement. Cela détermine votre niveau SP pour ce mois." },
          { heading: "Colonne: Dépôt", body: "Le dépôt supplémentaire ajouté ce mois. Vous pouvez le modifier directement dans le tableau." },
          { heading: "Colonne: Retrait % (Pourcentage de retrait)", body: "Le pourcentage de votre rendement mensuel brut payé en retrait." },
          { heading: "Colonne: Retrait (Montant fixe)", body: "Un montant fixe retiré de votre solde disponible ce mois." },
          { heading: "Colonne: Intérêt composé %", body: "Le pourcentage de votre solde restant (après retraits) réinvesti. Le montant composé est ajouté à un 'CompPot' — il n'est ajouté à votre capital principal que lorsque le CompPot atteint 100 $ ou plus." },
          { heading: "Colonne: Statut", body: "Affiche l'état actuel de votre capital:\n• 🟢 En croissance\n• 🟡 VIP actif\n• 🔴 Retrait effectué" },
          { heading: "Statistiques récapitulatives", body: "Total entrant, Total sortant, Solde final, Résultat net, Portefeuille+Pots, Coût VIP, Retrait mensuel max, ROC Seuil de rentabilité." },
        ],
      },
      es: {
        title: "Leyendo el desglose mensual",
        sections: [
          { heading: "Descripción general", body: "La tabla de desglose mensual muestra exactamente lo que le sucede a su capital cada mes. Cada fila es un mes." },
          { heading: "Columna: M (Número de mes)", body: "El número de mes secuencial comenzando desde 1. Las filas separadoras anuales aparecen entre meses." },
          { heading: "Columna: Diamantes (Capital inicial)", body: "Su saldo de capital al INICIO del mes, antes de depósitos o rendimiento. Esto determina su nivel SP para ese mes." },
          { heading: "Columna: Depósito", body: "El depósito adicional agregado este mes. Puede editar esto directamente en la tabla." },
          { heading: "Columna: Retiro % (Porcentaje de retiro)", body: "El porcentaje de su rendimiento mensual bruto pagado como retiro." },
          { heading: "Columna: Retiro (Monto fijo)", body: "Un monto fijo retirado de su saldo disponible este mes." },
          { heading: "Columna: Interés compuesto %", body: "El porcentaje de su saldo restante (después de retiros) que se reinvierte. El monto compuesto se agrega a un 'CompPot' — solo se agrega a su capital principal cuando el CompPot alcanza $100 o más." },
          { heading: "Columna: Estado", body: "Muestra el estado actual de su capital:\n• 🟢 Creciendo\n• 🟡 VIP activo\n• 🔴 Retiro realizado" },
          { heading: "Estadísticas de resumen", body: "Total entrada, Total salida, Saldo final, Resultado neto, Billetera+Botes, Costo VIP, Retiro mensual máximo, ROC Punto de equilibrio." },
        ],
      },
      ru: {
        title: "Чтение помесячной таблицы",
        sections: [
          { heading: "Обзор", body: "Помесячная таблица показывает, что происходит с вашим капиталом каждый месяц. Каждая строка — один месяц. Вы можете редактировать значения отдельных месяцев прямо в таблице." },
          { heading: "Колонка: M (Номер месяца)", body: "Порядковый номер месяца, начиная с 1. Разделительные строки года появляются между месяцами." },
          { heading: "Колонка: Алмазы (Начальный капитал)", body: "Баланс капитала в НАЧАЛЕ месяца, до депозитов или дохода. Это значение определяет уровень SP для данного месяца." },
          { heading: "Колонка: Депозит", body: "Дополнительный депозит, добавленный в этом месяце. Можно редактировать прямо в таблице." },
          { heading: "Колонка: Вывод % (Процент вывода)", body: "Процент от валового ежемесячного дохода, выплачиваемый как вывод. 0% = без выплат, 100% = весь доход выплачивается." },
          { heading: "Колонка: Вывод (Фиксированная сумма)", body: "Фиксированная сумма, выводимая из доступного баланса в этом месяце." },
          { heading: "Колонка: Сложный % (Процент сложного процента)", body: "Процент остатка (после вывода), реинвестируемый в капитал. Сложная сумма добавляется в «CompPot» — в основной капитал только когда CompPot достигает $100 и более." },
          { heading: "Колонка: План (Уровень SP)", body: "Уровень SP, активный в этом месяце (SP1–SP7), определяемый начальным капиталом." },
          { heading: "Колонка: Статус", body: "Текущее состояние капитала:\n• 🟢 Растёт\n• 🟡 VIP активен\n• 🔴 Совершён вывод" },
          { heading: "Колонка: Всего алмазов (Конечный капитал)", body: "Баланс капитала в КОНЦЕ месяца после всех операций. Становится значением «Алмазы» следующего месяца." },
          { heading: "Сводная статистика", body: "Всего вложено, Всего выведено, Конечный баланс, Чистый результат, Кошелёк+Котлы, Стоимость VIP, Макс. ежемесячный вывод, ROC точка безубыточности." },
        ],
      },
      zh: {
        title: "阅读月度明细",
        sections: [
          { heading: "概述", body: "月度明细表显示每月资本的确切变化。每行代表一个月。您可以直接在表格中编辑单个月份的值。" },
          { heading: "列：M（月数）", body: "从1开始的顺序月份编号。年份分隔行出现在月份之间。" },
          { heading: "列：钻石（初始资本）", body: "月初的资本余额，在存款或收益应用之前。此值用于确定该月的SP级别。" },
          { heading: "列：存款", body: "本月添加的额外存款。可以直接在表格中编辑。" },
          { heading: "列：提款%（提款百分比）", body: "作为提款支付的月度总收益百分比。0% = 不支付，100% = 全额收益支付。" },
          { heading: "列：提款（固定金额）", body: "本月从可用余额中提取的固定金额。" },
          { heading: "列：复利%（复利百分比）", body: "提款后余额中重新投入资本的百分比。复利金额添加到「CompPot」——只有当CompPot达到$100或以上时才添加到主要资本。" },
          { heading: "列：方案（SP级别）", body: "本月活跃的SP级别（SP1–SP7），由该月的初始资本决定。" },
          { heading: "列：状态", body: "资本的当前状态：\n• 🟢 增长中\n• 🟡 VIP激活\n• 🔴 已进行提款" },
          { heading: "列：总钻石（期末资本）", body: "月末的资本余额，应用所有操作后。成为下个月的「钻石」值。" },
          { heading: "汇总统计", body: "总投入、总产出、最终余额、净结果、钱包+池、VIP费用、最高月度产出、ROC盈亏平衡点。" },
        ],
      },
    },
    "4": {
      en: {
        title: "Disclaimer",
        sections: [
          {
            heading: "⚠️ Important Notice",
            body: "This app is provided for MATHEMATICAL CALCULATION PURPOSES ONLY. It is NOT financial advice in any form.",
          },
          {
            heading: "No Financial Advice",
            body: "The Plan B app is a simulation tool designed to illustrate mathematical scenarios. The calculations, projections, and results shown in this app do NOT constitute financial advice, investment recommendations, or any form of professional financial guidance.",
          },
          {
            heading: "Use at Your Own Risk",
            body: "Using this application is completely at your own risk. The creators and distributors of this app accept no responsibility or liability for any financial decisions made based on the calculations or projections shown.",
          },
          {
            heading: "No Guarantees",
            body: "Past results, historical data, and mathematical projections shown in this app give NO guarantees of future performance. Investment returns can go up as well as down. You may receive less than you invest.",
          },
          {
            heading: "Consult a Professional",
            body: "Before making any investment decisions, always consult a qualified and licensed financial advisor. This app is not a substitute for professional financial advice.",
          },
          {
            heading: "Accuracy",
            body: "While every effort has been made to ensure the accuracy of the calculations, the creators make no warranty, express or implied, regarding the accuracy, completeness, or reliability of the information provided.",
          },
        ],
      },
      nl: {
        title: "Disclaimer",
        sections: [
          { heading: "⚠️ Belangrijke Mededeling", body: "Deze app is uitsluitend bedoeld voor WISKUNDIGE BEREKENINGSDOELEINDEN. Het is GEEN financieel advies in welke vorm dan ook." },
          { heading: "Geen Financieel Advies", body: "De Plan B app is een simulatietool die wiskundige scenario's illustreert. De berekeningen en resultaten in deze app vormen GEEN financieel advies of beleggingsaanbevelingen." },
          { heading: "Gebruik op Eigen Risico", body: "Het gebruik van deze applicatie is volledig op eigen risico. De makers aanvaarden geen verantwoordelijkheid voor financiële beslissingen op basis van de berekeningen." },
          { heading: "Geen Garanties", body: "Resultaten uit het verleden, historische gegevens en wiskundige projecties geven GEEN garanties voor toekomstige prestaties." },
          { heading: "Raadpleeg een Professional", body: "Raadpleeg altijd een gekwalificeerde financieel adviseur voordat u investeringsbeslissingen neemt." },
        ],
      },
      de: {
        title: "Haftungsausschluss",
        sections: [
          { heading: "⚠️ Wichtiger Hinweis", body: "Diese App dient ausschließlich zu MATHEMATISCHEN BERECHNUNGSZWECKEN. Sie ist KEINE Finanzberatung in irgendeiner Form." },
          { heading: "Keine Finanzberatung", body: "Die Plan B App ist ein Simulationswerkzeug zur Veranschaulichung mathematischer Szenarien. Die Berechnungen und Ergebnisse stellen KEINE Finanzberatung oder Anlageempfehlungen dar." },
          { heading: "Nutzung auf eigenes Risiko", body: "Die Nutzung dieser Anwendung erfolgt vollständig auf eigenes Risiko. Die Ersteller übernehmen keine Verantwortung für finanzielle Entscheidungen auf der Grundlage der Berechnungen." },
          { heading: "Keine Garantien", body: "Vergangene Ergebnisse, historische Daten und mathematische Projektionen geben KEINE Garantien für zukünftige Leistungen." },
          { heading: "Konsultieren Sie einen Fachmann", body: "Konsultieren Sie immer einen qualifizierten Finanzberater, bevor Sie Anlageentscheidungen treffen." },
        ],
      },
      fr: {
        title: "Avertissement",
        sections: [
          { heading: "⚠️ Avis Important", body: "Cette application est fournie UNIQUEMENT À DES FINS DE CALCUL MATHÉMATIQUE. Elle ne constitue PAS un conseil financier sous quelque forme que ce soit." },
          { heading: "Pas de conseil financier", body: "L'application Plan B est un outil de simulation conçu pour illustrer des scénarios mathématiques. Les calculs et résultats ne constituent PAS des conseils financiers ou des recommandations d'investissement." },
          { heading: "Utilisation à vos propres risques", body: "L'utilisation de cette application est entièrement à vos propres risques. Les créateurs n'acceptent aucune responsabilité pour les décisions financières prises sur la base des calculs." },
          { heading: "Aucune garantie", body: "Les résultats passés, les données historiques et les projections mathématiques ne donnent AUCUNE garantie de performance future." },
          { heading: "Consultez un professionnel", body: "Consultez toujours un conseiller financier qualifié avant de prendre des décisions d'investissement." },
        ],
      },
      es: {
        title: "Aviso Legal",
        sections: [
          { heading: "⚠️ Aviso Importante", body: "Esta aplicación se proporciona ÚNICAMENTE CON FINES DE CÁLCULO MATEMÁTICO. NO es asesoramiento financiero en ninguna forma." },
          { heading: "Sin asesoramiento financiero", body: "La aplicación Plan B es una herramienta de simulación diseñada para ilustrar escenarios matemáticos. Los cálculos y resultados NO constituyen asesoramiento financiero ni recomendaciones de inversión." },
          { heading: "Uso bajo su propio riesgo", body: "El uso de esta aplicación es completamente bajo su propio riesgo. Los creadores no aceptan ninguna responsabilidad por decisiones financieras tomadas en base a los cálculos." },
          { heading: "Sin garantías", body: "Los resultados pasados, los datos históricos y las proyecciones matemáticas NO dan garantías de rendimiento futuro." },
          { heading: "Consulte a un profesional", body: "Siempre consulte a un asesor financiero calificado antes de tomar decisiones de inversión." },
        ],
      },
      ru: {
        title: "Отказ от ответственности",
        sections: [
          { heading: "⚠️ Важное уведомление", body: "Это приложение предназначено ИСКЛЮЧИТЕЛЬНО ДЛЯ МАТЕМАТИЧЕСКИХ РАСЧЁТОВ. Это НЕ финансовый совет в какой-либо форме." },
          { heading: "Не является финансовым советом", body: "Приложение Plan B — инструмент симуляции для иллюстрации математических сценариев. Расчёты и результаты НЕ являются финансовым советом или инвестиционными рекомендациями." },
          { heading: "Использование на собственный риск", body: "Использование приложения осуществляется полностью на ваш собственный риск. Создатели не несут ответственности за финансовые решения, принятые на основе расчётов." },
          { heading: "Без гарантий", body: "Прошлые результаты, исторические данные и математические проекции НЕ дают гарантий будущей эффективности. Инвестиционные доходы могут как расти, так и падать." },
          { heading: "Проконсультируйтесь со специалистом", body: "Перед принятием любых инвестиционных решений всегда консультируйтесь с квалифицированным лицензированным финансовым советником." },
        ],
      },
      zh: {
        title: "免责声明",
        sections: [
          { heading: "⚠️ 重要通知", body: "本应用程序仅用于数学计算目的。它不是任何形式的财务建议。" },
          { heading: "非财务建议", body: "Plan B应用程序是一个模拟工具，旨在说明数学场景。应用中显示的计算和结果不构成财务建议、投资建议或任何形式的专业财务指导。" },
          { heading: "风险自担", body: "使用本应用程序完全由您自己承担风险。应用的创建者和分发者不对基于所显示计算做出的任何财务决策承担责任。" },
          { heading: "无保证", body: "本应用中显示的过去结果、历史数据和数学预测不对未来表现提供任何保证。投资回报可能上升也可能下降。" },
          { heading: "咨询专业人士", body: "在做出任何投资决定之前，请务必咨询合格且持牌的财务顾问。本应用不能替代专业财务建议。" },
        ],
      },
    },
  };

  const langData = articles[articleId]?.[lang] ?? articles[articleId]?.["en"];
  return langData ?? { title: "Article not found", sections: [] };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HelpArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useCalculator();

  const article = getArticle(id ?? "1", language);

  return (
    <ScreenContainer bgColor="#0f172a">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Text style={S.backText}>← {t(language, "back")}</Text>
          </TouchableOpacity>
          <Text style={S.title}>{article.title}</Text>
        </View>

        {/* Disclaimer banner for article 4 */}
        {id === "4" && (
          <View style={S.disclaimerBanner}>
            <Text style={S.disclaimerBannerText}>⚠️ NOT FINANCIAL ADVICE</Text>
          </View>
        )}

        {/* Article sections */}
        <View style={S.body}>
          {article.sections.map((section, idx) => (
            <View key={idx} style={S.section}>
              {section.heading && (
                <Text style={[S.heading, id === "4" && S.headingRed]}>{section.heading}</Text>
              )}
              <Text style={S.bodyText}>{section.body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const S = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  backBtn: { marginBottom: 12 },
  backText: { color: "#38bdf8", fontSize: 17, fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", color: "#f1f5f9", lineHeight: 30 },
  disclaimerBanner: { backgroundColor: "#1e293b", borderLeftWidth: 4, borderLeftColor: "#ef4444", margin: 20, padding: 14, borderRadius: 8 },
  disclaimerBannerText: { color: "#ef4444", fontWeight: "bold", fontSize: 16, letterSpacing: 0.5 },
  body: { padding: 20, gap: 20 },
  section: { gap: 8 },
  heading: { fontSize: 18, fontWeight: "bold", color: "#38bdf8" },
  headingRed: { color: "#ef4444" },
  bodyText: { fontSize: 16, color: "#e2e8f0", lineHeight: 25 },
});

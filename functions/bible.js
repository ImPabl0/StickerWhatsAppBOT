const scripture = {
    book: {
      abbrev: { pt: "gn", en: "gn" },
      name: "Gênesis",
      author: "Moisés",
      group: "Pentateuco",
      version: "nvi"
    },
    chapter: 1,
    number: 1,
    text: "No princípio Deus criou os céus e a terra."
  };

 async function getVersiculo() {
    var versiculoFinal="";
   await fetch("https://www.abibliadigital.com.br/api/verses/nvi/random").then(res=>res.json()).then((result)=>{
     try {
      versiculoFinal+="\""+result.text+"\""+"\n";
      versiculoFinal+=result.book.name+" ";
      versiculoFinal+=result.chapter+":"+result.number;
     } catch (error) {
      versiculoFinal = "Erro ao receber versículo, tente novamente.";
     }
    })
    return versiculoFinal;
  }
  module.exports={getVersiculo};
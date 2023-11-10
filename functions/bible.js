const scripture = {
    book: {
      abbrev: { },
      name,
      author,
      group,
      version
    },
    chapter,
    number,
    text
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

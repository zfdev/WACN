var xlsxToJSON = require('xlsx-to-json');
var oConfig = {
	fileSource: 'WACN_Top_Foot_HomePage_URLLinks_Rev.FY16.xlsx',
	fileOutput: 'navigation.json'
}
xlsxToJSON({
	input: oConfig.fileSource,
	output: oConfig.fileOutput
}, function(err, result){
	if(err){
		console.log(err);	
	}else{
		console.log(result);
	}
});
